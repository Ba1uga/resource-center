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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;


@Service
public class CoursewareServiceImpl extends ServiceImpl<CoursewareMapper, Courseware> implements CoursewareService {

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
        Courseware courseware = Courseware.builder()
                .title(request.getTitle().trim())
                .course(request.getCourse().trim())
                .chapter(request.getChapter().trim())
                .type(request.getType().trim())
                .fileSize(request.getFileSize().trim())
                .uploadedBy(request.getUploadedBy().trim())
                .uploadedAt(LocalDate.now())
                .deleted(0)
                .build();

        save(courseware);
        return getById(courseware.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Courseware updateCourseware(Long id, CoursewareUpdateRequest request) {
        Courseware courseware = getById(id);
        if (courseware == null) {
            throw new IllegalArgumentException("课件不存在");
        }

        courseware.setTitle(request.getTitle().trim());
        courseware.setCourse(request.getCourse().trim());
        courseware.setChapter(request.getChapter().trim());
        courseware.setType(request.getType().trim());
        courseware.setFileSize(request.getFileSize().trim());
        courseware.setUploadedAt(LocalDate.now());

        updateById(courseware);
        return getById(id);
    }
}