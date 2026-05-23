package com.baluga.backend.modules.courseware.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baluga.backend.common.api.R;
import com.baluga.backend.modules.courseware.dto.request.CoursewareCreateRequest;
import com.baluga.backend.modules.courseware.dto.request.CoursewarePageRequest;
import com.baluga.backend.modules.courseware.dto.request.CoursewareUpdateRequest;
import com.baluga.backend.modules.courseware.dto.response.CoursewareVO;
import com.baluga.backend.modules.courseware.entity.Courseware;
import com.baluga.backend.modules.courseware.service.CoursewareService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.validation.annotation.Validated;


@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/courseware")
public class CoursewareController {

    private final CoursewareService coursewareService;

    @GetMapping
    public R<Page<CoursewareVO>> listCoursewares(@Valid CoursewarePageRequest request) {
        Page<Courseware> pageResult = coursewareService.pageCoursewares(
                request.getKeyword(),
                request.getCourse(),
                request.getType(),
                request.getPage(),
                request.getPageSize()
        );

        Page<CoursewareVO> responsePage = new Page<>(pageResult.getCurrent(), pageResult.getSize(), pageResult.getTotal());
        responsePage.setRecords(pageResult.getRecords().stream().map(CoursewareVO::fromEntity).toList());
        return R.ok(responsePage);
    }

    @GetMapping("/{id}")
    public R<?> getCourseware(@PathVariable Long id) {
        Courseware courseware = coursewareService.getById(id);
        if (courseware == null) {
            return R.fail("课件不存在");
        }
        return R.ok(CoursewareVO.fromEntity(courseware));
    }

    @PostMapping
    public R<CoursewareVO> createCourseware(@Valid @RequestBody CoursewareCreateRequest request) {
        Courseware courseware = coursewareService.createCourseware(request);
        return R.ok(CoursewareVO.fromEntity(courseware));
    }

    @PutMapping("/{id}")
    public R<?> updateCourseware(@PathVariable Long id, @Valid @RequestBody CoursewareUpdateRequest request) {
        Courseware courseware = coursewareService.updateCourseware(id, request);
        return R.ok(CoursewareVO.fromEntity(courseware));
    }

    @DeleteMapping("/{id}")
    public R<?> deleteCourseware(@PathVariable Long id) {
        Courseware courseware = coursewareService.getById(id);
        if (courseware == null) {
            return R.fail("课件不存在");
        }

        coursewareService.deleteCoursewareWithAssets(id);
        return R.ok();
    }
}