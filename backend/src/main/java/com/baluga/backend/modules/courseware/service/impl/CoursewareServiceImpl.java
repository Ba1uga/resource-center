package com.baluga.backend.modules.courseware.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.baluga.backend.modules.courseware.dto.request.CoursewareCreateRequest;
import com.baluga.backend.modules.courseware.dto.request.CoursewareUpdateRequest;
import com.baluga.backend.modules.courseware.entity.Courseware;
import com.baluga.backend.modules.courseware.mapper.CoursewareMapper;
import com.baluga.backend.modules.courseware.service.CoursewareService;
import com.baluga.backend.modules.storage.config.StorageProperties;
import com.baluga.backend.modules.storage.entity.ResourceAsset;
import com.baluga.backend.modules.storage.mapper.ResourceAssetMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;


@Slf4j
@Service
@RequiredArgsConstructor
public class CoursewareServiceImpl extends ServiceImpl<CoursewareMapper, Courseware> implements CoursewareService {

    private final ResourceAssetMapper resourceAssetMapper;
    private final StorageProperties storageProperties;

    @Override
    public Page<Courseware> pageCoursewares(String keyword, String course, String type, Integer page, Integer pageSize) {
        long currentPage = page != null && page > 0 ? page : 1L;
        long currentPageSize = pageSize != null && pageSize > 0 ? pageSize : 10L;

        LambdaQueryWrapper<Courseware> queryWrapper = Wrappers.lambdaQuery();
        String normalizedKeyword = keyword != null ? keyword.trim() : "";
        String normalizedCourse = course != null ? course.trim() : "";
        String normalizedType = type != null ? type.trim() : "";

        if (StringUtils.hasText(normalizedKeyword)) {
            queryWrapper.and(wrapper -> wrapper.like(Courseware::getTitle, normalizedKeyword)
                    .or()
                    .like(Courseware::getCourse, normalizedKeyword)
                    .or()
                    .like(Courseware::getChapter, normalizedKeyword));
        }

        if (StringUtils.hasText(normalizedCourse)) {
            queryWrapper.eq(Courseware::getCourse, normalizedCourse);
        }

        if (StringUtils.hasText(normalizedType)) {
            queryWrapper.eq(Courseware::getType, normalizedType);
        }

        queryWrapper.orderByDesc(Courseware::getUploadedAt).orderByDesc(Courseware::getId);
        return page(new Page<>(currentPage, currentPageSize), queryWrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Courseware createCourseware(CoursewareCreateRequest request) {
        log.info("创建课件: title={}, assetId={}", request.getTitle(), request.getAssetId());
        Courseware courseware = Courseware.builder()
                .title(request.getTitle().trim())
                .course(request.getCourse().trim())
                .chapter(request.getChapter().trim())
                .type(request.getType().trim())
                .fileSize(request.getFileSize().trim())
                .uploadedBy(request.getUploadedBy().trim())
                .uploadedAt(LocalDate.now())
                .assetId(request.getAssetId())
                .deleted(0)
                .build();

        save(courseware);

        linkAsset(courseware.getId(), courseware.getAssetId(), "课件");
        return getById(courseware.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Courseware updateCourseware(Long id, CoursewareUpdateRequest request) {
        Courseware courseware = getById(id);
        if (courseware == null) {
            throw new IllegalArgumentException("课件不存在");
        }

        Long newAssetId = request.getAssetId();
        Long oldAssetId = courseware.getAssetId();

        if (newAssetId != null && !newAssetId.equals(oldAssetId)) {
            if (oldAssetId != null) {
                deleteSingleAsset(oldAssetId);
            }
            linkAsset(id, newAssetId, "课件");
            log.info("替换课件资源: old={}, new={}, coursewareId={}", oldAssetId, newAssetId, id);
        }

        courseware.setTitle(request.getTitle().trim());
        courseware.setCourse(request.getCourse().trim());
        courseware.setChapter(request.getChapter().trim());
        courseware.setType(request.getType().trim());
        courseware.setFileSize(request.getFileSize().trim());
        courseware.setUploadedAt(LocalDate.now());
        courseware.setAssetId(newAssetId != null ? newAssetId : oldAssetId);

        updateById(courseware);
        return getById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteCoursewareWithAssets(Long id) {
        Courseware courseware = getById(id);
        if (courseware != null && courseware.getAssetId() != null) {
            deleteSingleAsset(courseware.getAssetId());
        }
        deleteLinkedAssets(id, "courseware");
        super.removeById(id);
        log.info("课件已删除: coursewareId={}", id);
    }

    private void linkAsset(Long moduleId, Long assetId, String label) {
        if (assetId == null) return;
        ResourceAsset asset = resourceAssetMapper.selectById(assetId);
        if (asset != null && "courseware".equals(asset.getModuleType())) {
            asset.setModuleId(moduleId);
            resourceAssetMapper.updateById(asset);
            log.info("关联{}资源: assetId={}, moduleId={}", label, assetId, moduleId);
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

    private void deleteLinkedAssets(Long moduleId, String moduleType) {
        LambdaQueryWrapper<ResourceAsset> wrapper = Wrappers.lambdaQuery();
        wrapper.eq(ResourceAsset::getModuleType, moduleType)
               .eq(ResourceAsset::getModuleId, moduleId);
        for (ResourceAsset asset : resourceAssetMapper.selectList(wrapper)) {
            deleteSingleAsset(asset.getId());
        }
    }
}
