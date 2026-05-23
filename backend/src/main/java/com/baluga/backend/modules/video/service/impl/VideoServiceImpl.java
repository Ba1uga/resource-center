package com.baluga.backend.modules.video.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.baluga.backend.modules.storage.config.StorageProperties;
import com.baluga.backend.modules.storage.entity.ResourceAsset;
import com.baluga.backend.modules.storage.mapper.ResourceAssetMapper;
import com.baluga.backend.modules.video.dto.request.VideoCreateRequest;
import com.baluga.backend.modules.video.dto.request.VideoUpdateRequest;
import com.baluga.backend.modules.video.entity.Video;
import com.baluga.backend.modules.video.mapper.VideoMapper;
import com.baluga.backend.modules.video.service.VideoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;


@Slf4j
@Service
@RequiredArgsConstructor
public class VideoServiceImpl extends ServiceImpl<VideoMapper, Video> implements VideoService {

    private final ObjectMapper objectMapper;
    private final ResourceAssetMapper resourceAssetMapper;
    private final StorageProperties storageProperties;

    @Override
    public Page<Video> pageVideos(String keyword, String course, String chapter,
                                   String processingStatus, String publishStatus,
                                   String uploadedBy, String uploadedFrom, String uploadedTo,
                                   Integer page, Integer pageSize) {
        long currentPage = page != null && page > 0 ? page : 1L;
        long currentPageSize = pageSize != null && pageSize > 0 ? pageSize : 10L;

        LambdaQueryWrapper<Video> queryWrapper = Wrappers.lambdaQuery();
        String normalizedKeyword = keyword != null ? keyword.trim() : "";
        String normalizedCourse = course != null ? course.trim() : "";
        String normalizedChapter = chapter != null ? chapter.trim() : "";
        String normalizedProcessingStatus = processingStatus != null ? processingStatus.trim() : "";
        String normalizedPublishStatus = publishStatus != null ? publishStatus.trim() : "";
        String normalizedUploadedBy = uploadedBy != null ? uploadedBy.trim() : "";

        if (StringUtils.hasText(normalizedKeyword)) {
            queryWrapper.and(wrapper -> wrapper.like(Video::getTitle, normalizedKeyword)
                    .or()
                    .like(Video::getKnowledgePoint, normalizedKeyword)
                    .or()
                    .like(Video::getDescription, normalizedKeyword));
        }

        if (StringUtils.hasText(normalizedCourse)) {
            queryWrapper.eq(Video::getCourse, normalizedCourse);
        }

        if (StringUtils.hasText(normalizedChapter)) {
            queryWrapper.eq(Video::getChapter, normalizedChapter);
        }

        if (StringUtils.hasText(normalizedProcessingStatus)) {
            queryWrapper.eq(Video::getProcessingStatus, normalizedProcessingStatus);
        }

        if (StringUtils.hasText(normalizedPublishStatus)) {
            queryWrapper.eq(Video::getPublishStatus, normalizedPublishStatus);
        }

        if (StringUtils.hasText(normalizedUploadedBy)) {
            queryWrapper.eq(Video::getUploadedBy, normalizedUploadedBy);
        }

        if (StringUtils.hasText(normalize(uploadedFrom))) {
            queryWrapper.ge(Video::getUploadedAt, LocalDate.parse(normalize(uploadedFrom)));
        }

        if (StringUtils.hasText(normalize(uploadedTo))) {
            queryWrapper.le(Video::getUploadedAt, LocalDate.parse(normalize(uploadedTo)));
        }

        queryWrapper.orderByDesc(Video::getUpdatedAt).orderByDesc(Video::getId);
        return page(new Page<>(currentPage, currentPageSize), queryWrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Video createVideo(VideoCreateRequest request) {
        log.info("创建视频: title={}, assetId={}", normalize(request.getTitle()), request.getAssetId());
        Video video = Video.builder()
                .title(normalize(request.getTitle()))
                .course(normalize(request.getCourse()))
                .chapter(normalize(request.getChapter()))
                .duration(defaultString(request.getDuration()))
                .resolution(defaultString(request.getResolution(), "1080p"))
                .viewCount(request.getViewCount() != null ? request.getViewCount() : 0)
                .uploadedBy(normalize(request.getUploadedBy()))
                .uploadedAt(LocalDate.now())
                .fileSize(defaultString(request.getFileSize()))
                .lastEditedAt(LocalDateTime.now())
                .coverLabel("")
                .knowledgePoint(defaultString(request.getKnowledgePoint()))
                .tags(writeJson(request.getTags() != null ? request.getTags() : List.of()))
                .description(defaultString(request.getDescription()))
                .processingStatus(defaultString(request.getProcessingStatus(), "uploading"))
                .publishStatus(defaultString(request.getPublishStatus(), "draft"))
                .assetId(request.getAssetId())
                .resourceAlert(null)
                .visibility(defaultString(request.getVisibility(), "students"))
                .scheduledPublishAt(parseDateTime(request.getScheduledPublishAt()))
                .deleted(0)
                .build();

        save(video);

        if (video.getAssetId() != null) {
            ResourceAsset asset = resourceAssetMapper.selectById(video.getAssetId());
            if (asset != null && "video".equals(asset.getModuleType())) {
                asset.setModuleId(video.getId());
                resourceAssetMapper.updateById(asset);
                log.info("关联资源资产: assetId={}, videoId={}", asset.getId(), video.getId());
            }
        }

        return getById(video.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Video updateVideo(Long id, VideoUpdateRequest request) {
        Video video = getById(id);
        if (video == null) {
            throw new IllegalArgumentException("视频不存在");
        }

        Long newAssetId = request.getAssetId();
        Long oldAssetId = video.getAssetId();

        // Atomically replace old asset with new one
        if (newAssetId != null && !newAssetId.equals(oldAssetId)) {
            if (oldAssetId != null) {
                deleteSingleAsset(oldAssetId);
            }
            ResourceAsset newAsset = resourceAssetMapper.selectById(newAssetId);
            if (newAsset != null && "video".equals(newAsset.getModuleType())) {
                newAsset.setModuleId(video.getId());
                resourceAssetMapper.updateById(newAsset);
                log.info("替换资源资产: oldAssetId={}, newAssetId={}, videoId={}",
                        oldAssetId, newAssetId, id);
            }
        }

        video.setTitle(normalize(request.getTitle()));
        video.setCourse(normalize(request.getCourse()));
        video.setChapter(normalize(request.getChapter()));
        video.setDuration(defaultString(request.getDuration()));
        video.setResolution(defaultString(request.getResolution(), "1080p"));
        video.setViewCount(request.getViewCount() != null ? request.getViewCount() : 0);
        video.setFileSize(defaultString(request.getFileSize()));
        video.setKnowledgePoint(defaultString(request.getKnowledgePoint()));
        video.setTags(writeJson(request.getTags() != null ? request.getTags() : List.of()));
        video.setDescription(defaultString(request.getDescription()));
        video.setProcessingStatus(defaultString(request.getProcessingStatus(), "ready"));
        video.setPublishStatus(defaultString(request.getPublishStatus(), "draft"));
        video.setAssetId(newAssetId != null ? newAssetId : oldAssetId);
        video.setVisibility(defaultString(request.getVisibility(), "students"));
        video.setScheduledPublishAt(parseDateTime(request.getScheduledPublishAt()));
        video.setLastEditedAt(LocalDateTime.now());

        updateById(video);
        return getById(id);
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
            log.info("已清理旧资源资产: assetId={}, path={}", assetId, filePath);
        } catch (IOException e) {
            log.warn("清理旧资源文件失败: assetId={}", assetId, e);
            throw new RuntimeException("旧资源文件清理失败", e);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteVideoWithAssets(Long id) {
        log.info("deleteVideoWithAssets 开始: videoId={}", id);
        deleteLinkedAssets(id);
        log.info("deleteVideoWithAssets 资产已清理, 准备删除视频记录");
        super.removeById(id);
        log.info("deleteVideoWithAssets 完成: videoId={}", id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void batchPublish(List<Long> ids) {
        for (Long id : ids) {
            Video video = getById(id);
            if (video != null) {
                video.setProcessingStatus("ready");
                video.setPublishStatus("published");
                video.setLastEditedAt(LocalDateTime.now());
                updateById(video);
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void batchOffline(List<Long> ids) {
        for (Long id : ids) {
            Video video = getById(id);
            if (video != null) {
                video.setPublishStatus("offline");
                video.setLastEditedAt(LocalDateTime.now());
                updateById(video);
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void batchDelete(List<Long> ids) {
        for (Long id : ids) {
            deleteLinkedAssets(id);
            super.removeById(id);
        }
    }

    private void deleteLinkedAssets(Long videoId) {
        Video video = getById(videoId);

        // Path 1: find assets linked by module_id
        LambdaQueryWrapper<ResourceAsset> wrapper = Wrappers.lambdaQuery();
        wrapper.eq(ResourceAsset::getModuleType, "video")
               .eq(ResourceAsset::getModuleId, videoId);
        List<ResourceAsset> assets = resourceAssetMapper.selectList(wrapper);

        // Path 2: if no assets found by module_id, try direct lookup via video.assetId
        if (assets.isEmpty() && video != null && video.getAssetId() != null) {
            ResourceAsset directAsset = resourceAssetMapper.selectById(video.getAssetId());
            if (directAsset != null && "video".equals(directAsset.getModuleType())) {
                assets = List.of(directAsset);
                log.info("通过 video.assetId 直接定位到资源资产: assetId={}", directAsset.getId());
            }
        }

        if (assets.isEmpty()) {
            log.warn("未找到关联的资源资产记录: videoId={}, videoAssetId={}", videoId,
                    video != null ? video.getAssetId() : null);
        }

        for (ResourceAsset asset : assets) {
            try {
                Path filePath = Path.of(storageProperties.getUploadDir(), asset.getObjectKey());
                Files.deleteIfExists(filePath);
                Path parentDir = filePath.getParent();
                if (Files.exists(parentDir) && Files.isDirectory(parentDir)) {
                    try {
                        Files.deleteIfExists(parentDir);
                    } catch (IOException ignored) {
                        // directory may not be empty if other files share the groupToken
                    }
                }
                resourceAssetMapper.deleteById(asset.getId());
                log.info("已清理资源资产: assetId={}, path={}", asset.getId(), filePath);
            } catch (IOException e) {
                log.warn("清理资源文件失败: assetId={}, path={}", asset.getId(), asset.getObjectKey(), e);
            }
        }
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception ex) {
            throw new IllegalStateException("标签序列化失败", ex);
        }
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private String defaultString(String value) {
        return value == null ? "" : value.trim();
    }

    private String defaultString(String value, String defaultValue) {
        String trimmed = value == null ? "" : value.trim();
        return StringUtils.hasText(trimmed) ? trimmed : defaultValue;
    }

    private LocalDateTime parseDateTime(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return LocalDateTime.parse(value.trim(), DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        } catch (Exception ex) {
            return null;
        }
    }
}
