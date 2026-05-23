package com.baluga.backend.modules.courseware.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.baluga.backend.modules.courseware.dto.request.CoursewareCreateRequest;
import com.baluga.backend.modules.courseware.dto.request.CoursewareUpdateRequest;
import com.baluga.backend.modules.courseware.entity.Courseware;


public interface CoursewareService extends IService<Courseware> {

    Page<Courseware> pageCoursewares(String keyword, String course, String type, Integer page, Integer pageSize);

    Courseware createCourseware(CoursewareCreateRequest request);

    Courseware updateCourseware(Long id, CoursewareUpdateRequest request);

    void deleteCoursewareWithAssets(Long id);
}