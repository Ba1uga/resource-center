package com.baluga.backend.modules.mapping.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baluga.backend.infrastructure.integration.parsing.DocumentParser;
import com.baluga.backend.infrastructure.integration.parsing.DocumentParserFactory;
import com.baluga.backend.modules.mapping.entity.ResourceContent;
import com.baluga.backend.modules.mapping.mapper.ResourceContentMapper;
import com.baluga.backend.modules.mapping.service.ResourceParseService;
import com.baluga.backend.modules.storage.config.StorageProperties;
import com.baluga.backend.modules.storage.entity.ResourceAsset;
import com.baluga.backend.modules.storage.mapper.ResourceAssetMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;


@Service
public class ResourceParseServiceImpl implements ResourceParseService {

    private static final Logger log = LoggerFactory.getLogger(ResourceParseServiceImpl.class);

    private final ResourceContentMapper resourceContentMapper;
    private final ResourceAssetMapper resourceAssetMapper;
    private final StorageProperties storageProperties;
    private final DocumentParserFactory parserFactory;

    public ResourceParseServiceImpl(
            ResourceContentMapper resourceContentMapper,
            ResourceAssetMapper resourceAssetMapper,
            StorageProperties storageProperties) {
        this.resourceContentMapper = resourceContentMapper;
        this.resourceAssetMapper = resourceAssetMapper;
        this.storageProperties = storageProperties;
        this.parserFactory = new DocumentParserFactory();
    }

    @Override
    public ResourceContent getOrParse(String resourceType, Long resourceId) {
        LambdaQueryWrapper<ResourceContent> wrapper = Wrappers.lambdaQuery();
        wrapper.eq(ResourceContent::getResourceType, resourceType)
               .eq(ResourceContent::getResourceId, resourceId);
        ResourceContent existing = resourceContentMapper.selectOne(wrapper);

        if (existing != null && "completed".equals(existing.getParseStatus())) {
            return existing;
        }

        return parseResource(resourceType, resourceId, existing);
    }

    private ResourceContent parseResource(String resourceType, Long resourceId, ResourceContent existing) {
        ResourceContent content = existing != null ? existing : ResourceContent.builder()
                .resourceType(resourceType)
                .resourceId(resourceId)
                .parseStatus("parsing")
                .textFormat("plain")
                .wordCount(0)
                .parseError("")
                .deleted(0)
                .build();

        try {
            String text = extractText(resourceType, resourceId, content);
            content.setFullText(text != null ? text : "");
            content.setWordCount(countWords(content.getFullText()));
            content.setParseStatus("completed");
            content.setParsedAt(LocalDateTime.now());
        } catch (Exception e) {
            log.error("解析失败: resourceType={}, resourceId={}", resourceType, resourceId, e);
            content.setFullText("");
            content.setParseError(e.getMessage() != null ? e.getMessage() : "未知错误");
            content.setParseStatus("failed");
        }

        if (existing != null) {
            resourceContentMapper.updateById(content);
        } else {
            resourceContentMapper.insert(content);
        }

        return content;
    }

    private String extractText(String resourceType, Long resourceId, ResourceContent content) {
        ResourceAsset asset = findAsset(resourceType, resourceId);
        if (asset == null || !"success".equals(asset.getUploadStatus())) {
            return "";
        }

        Path filePath = Path.of(storageProperties.getUploadDir(), asset.getObjectKey());
        if (!Files.exists(filePath)) {
            log.warn("资源文件不存在: {}", filePath);
            return "";
        }

        DocumentParser parser = parserFactory.getParser(asset.getMimeType(), asset.getOriginName());
        if (parser == null) {
            log.debug("无专用解析器: {}, 返回空内容", asset.getOriginName());
            return "";
        }

        try (InputStream in = Files.newInputStream(filePath)) {
            DocumentParser.ParsedDocument doc = parser.parse(in, asset.getOriginName(), asset.getMimeType());
            content.setTextFormat(doc.textFormat());
            return doc.fullText();
        } catch (Exception e) {
            throw new RuntimeException("文档解析失败: " + asset.getOriginName(), e);
        }
    }

    private ResourceAsset findAsset(String resourceType, Long resourceId) {
        LambdaQueryWrapper<ResourceAsset> wrapper = Wrappers.lambdaQuery();
        wrapper.eq(ResourceAsset::getModuleType, resourceType)
               .eq(ResourceAsset::getModuleId, resourceId)
               .eq(ResourceAsset::getUploadStatus, "success")
               .orderByDesc(ResourceAsset::getCreatedAt)
               .last("LIMIT 1");
        return resourceAssetMapper.selectOne(wrapper);
    }

    private int countWords(String text) {
        if (text == null || text.isEmpty()) return 0;
        int count = 0;
        for (char c : text.toCharArray()) {
            if (Character.UnicodeScript.of(c) == Character.UnicodeScript.HAN) count++;
        }
        count += text.split("\\s+").length;
        return count;
    }
}
