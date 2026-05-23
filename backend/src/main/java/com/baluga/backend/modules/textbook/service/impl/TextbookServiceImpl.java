package com.baluga.backend.modules.textbook.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.baluga.backend.modules.storage.config.StorageProperties;
import com.baluga.backend.modules.storage.entity.ResourceAsset;
import com.baluga.backend.modules.storage.mapper.ResourceAssetMapper;
import com.baluga.backend.modules.textbook.dto.request.TextbookCreateRequest;
import com.baluga.backend.modules.textbook.dto.request.TextbookUpdateRequest;
import com.baluga.backend.modules.textbook.entity.Textbook;
import com.baluga.backend.modules.textbook.mapper.TextbookMapper;
import com.baluga.backend.modules.textbook.service.TextbookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;


@Slf4j
@Service
@RequiredArgsConstructor
public class TextbookServiceImpl extends ServiceImpl<TextbookMapper, Textbook> implements TextbookService {

    private final ResourceAssetMapper resourceAssetMapper;
    private final StorageProperties storageProperties;

    @Override
    public Page<Textbook> pageTextbooks(String keyword, String course, Integer page, Integer pageSize) {
        long currentPage = page != null && page > 0 ? page : 1L;
        long currentPageSize = pageSize != null && pageSize > 0 ? pageSize : 10L;

        LambdaQueryWrapper<Textbook> queryWrapper = Wrappers.lambdaQuery();
        String normalizedKeyword = keyword != null ? keyword.trim() : "";
        String normalizedCourse = course != null ? course.trim() : "";

        if (StringUtils.hasText(normalizedKeyword)) {
            queryWrapper.and(wrapper -> wrapper.like(Textbook::getName, normalizedKeyword)
                    .or()
                    .like(Textbook::getAuthor, normalizedKeyword)
                    .or()
                    .like(Textbook::getIsbn, normalizedKeyword));
        }

        if (StringUtils.hasText(normalizedCourse)) {
            queryWrapper.eq(Textbook::getCourse, normalizedCourse);
        }

        queryWrapper.orderByDesc(Textbook::getUpdatedAt);
        return page(new Page<>(currentPage, currentPageSize), queryWrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Textbook createTextbook(TextbookCreateRequest request) {
        log.info("创建教材: name={}, assetId={}", request.getName(), request.getAssetId());
        Textbook textbook = Textbook.builder()
                .name(request.getName().trim())
                .author(request.getAuthor().trim())
                .publisher(request.getPublisher().trim())
                .edition(request.getEdition().trim())
                .isbn(request.getIsbn().trim())
                .course(request.getCourse().trim())
                .ownerId(request.getOwnerId().trim())
                .assetId(request.getAssetId())
                .deleted(0)
                .build();

        save(textbook);
        linkAsset(textbook.getId(), textbook.getAssetId());
        return getById(textbook.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Textbook updateTextbook(Long id, TextbookUpdateRequest request) {
        Textbook textbook = getById(id);
        if (textbook == null) {
            throw new IllegalArgumentException("教材不存在");
        }

        Long newAssetId = request.getAssetId();
        Long oldAssetId = textbook.getAssetId();

        if (newAssetId != null && !newAssetId.equals(oldAssetId)) {
            if (oldAssetId != null) {
                deleteSingleAsset(oldAssetId);
            }
            linkAsset(id, newAssetId);
            log.info("替换教材资源: old={}, new={}, textbookId={}", oldAssetId, newAssetId, id);
        }

        textbook.setName(request.getName().trim());
        textbook.setAuthor(request.getAuthor().trim());
        textbook.setPublisher(request.getPublisher().trim());
        textbook.setEdition(request.getEdition().trim());
        textbook.setIsbn(request.getIsbn().trim());
        textbook.setCourse(request.getCourse().trim());
        textbook.setAssetId(newAssetId != null ? newAssetId : oldAssetId);

        updateById(textbook);
        return getById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteTextbookWithAssets(Long id) {
        Textbook textbook = getById(id);
        if (textbook != null && textbook.getAssetId() != null) {
            deleteSingleAsset(textbook.getAssetId());
        }
        deleteLinkedAssets(id);
        super.removeById(id);
        log.info("教材已删除: textbookId={}", id);
    }

    private void linkAsset(Long moduleId, Long assetId) {
        if (assetId == null) return;
        ResourceAsset asset = resourceAssetMapper.selectById(assetId);
        if (asset != null && "textbook".equals(asset.getModuleType())) {
            asset.setModuleId(moduleId);
            resourceAssetMapper.updateById(asset);
            log.info("关联教材资源: assetId={}, textbookId={}", assetId, moduleId);
        }
    }

    private void deleteSingleAsset(Long assetId) {
        ResourceAsset asset = resourceAssetMapper.selectById(assetId);
        if (asset == null) return;

        try {
            Path filePath = Path.of(storageProperties.getUploadDir(), asset.getObjectKey());
            Files.deleteIfExists(filePath);
            Path parentDir = filePath.getParent();
            if (Files.exists(parentDir) && Files.isDirectory(parentDir)) {
                try {
                    Files.deleteIfExists(parentDir);
                } catch (IOException ignored) {
                }
            }
            resourceAssetMapper.deleteById(assetId);
            log.info("已清理资源: assetId={}, path={}", assetId, filePath);
        } catch (IOException e) {
            log.warn("清理资源文件失败: assetId={}", assetId, e);
            throw new RuntimeException("资源文件清理失败", e);
        }
    }

    private void deleteLinkedAssets(Long moduleId) {
        LambdaQueryWrapper<ResourceAsset> wrapper = Wrappers.lambdaQuery();
        wrapper.eq(ResourceAsset::getModuleType, "textbook")
               .eq(ResourceAsset::getModuleId, moduleId);
        for (ResourceAsset asset : resourceAssetMapper.selectList(wrapper)) {
            deleteSingleAsset(asset.getId());
        }
    }
}
