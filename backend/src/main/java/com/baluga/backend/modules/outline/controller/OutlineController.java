package com.baluga.backend.modules.outline.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baluga.backend.common.api.R;
import com.baluga.backend.modules.outline.dto.request.OutlineCreateCourseRequest;
import com.baluga.backend.modules.outline.dto.request.OutlineCreateVersionRequest;
import com.baluga.backend.modules.outline.dto.request.OutlineDuplicateVersionRequest;
import com.baluga.backend.modules.outline.dto.request.OutlineListRequest;
import com.baluga.backend.modules.outline.dto.request.OutlineSaveVersionRequest;
import com.baluga.backend.modules.outline.dto.response.OutlineCourseVO;
import com.baluga.backend.modules.outline.dto.response.OutlineCourseSummaryVO;
import com.baluga.backend.modules.outline.dto.response.OutlineVersionSummaryVO;
import com.baluga.backend.modules.outline.dto.response.OutlineVersionVO;
import com.baluga.backend.modules.outline.entity.OutlineCourse;
import com.baluga.backend.modules.outline.entity.OutlineVersion;
import com.baluga.backend.modules.outline.service.OutlineService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;


@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/outline")
public class OutlineController {

    private final OutlineService outlineService;
    private final ObjectMapper objectMapper;

    @GetMapping("/courses")
    public R<Page<OutlineCourseSummaryVO>> listCourses(@Valid OutlineListRequest request) {
        return R.ok(outlineService.pageCourseSummaries(request));
    }

    @GetMapping("/courses/{courseId}/versions")
    public R<Page<OutlineVersionSummaryVO>> listCourseVersions(
            @PathVariable Long courseId,
            @Valid OutlineListRequest request
    ) {
        return R.ok(outlineService.pageCourseVersions(courseId, request));
    }

    @GetMapping("/versions/{id}")
    public R<?> getVersion(@PathVariable Long id) {
        OutlineVersion version = outlineService.getVersion(id);
        if (version == null) {
            return R.fail("大纲版本不存在");
        }
        return R.ok(OutlineVersionVO.fromEntity(version, version.getCourseTitle(), objectMapper));
    }

    @PostMapping("/courses")
    public R<OutlineCourseVO> createCourse(@Valid @RequestBody OutlineCreateCourseRequest request) {
        OutlineCourse course = outlineService.createCourse(request);
        return R.ok(OutlineCourseVO.fromEntity(course, Collections.emptyList()));
    }

    @PostMapping("/versions")
    public R<OutlineVersionVO> createVersion(@Valid @RequestBody OutlineCreateVersionRequest request) {
        OutlineVersion version = outlineService.createVersion(request);
        return R.ok(OutlineVersionVO.fromEntity(version, version.getCourseTitle(), objectMapper));
    }

    @PostMapping("/versions/duplicate")
    public R<OutlineVersionVO> duplicateVersion(@Valid @RequestBody OutlineDuplicateVersionRequest request) {
        OutlineVersion version = outlineService.duplicateVersion(request);
        return R.ok(OutlineVersionVO.fromEntity(version, version.getCourseTitle(), objectMapper));
    }

    @PutMapping("/versions/{id}")
    public R<OutlineVersionVO> saveVersion(@PathVariable Long id, @Valid @RequestBody OutlineSaveVersionRequest request) {
        OutlineVersion version = outlineService.saveVersion(id, request);
        return R.ok(OutlineVersionVO.fromEntity(version, version.getCourseTitle(), objectMapper));
    }

    @PutMapping("/versions/{id}/archive")
    public R<Void> archiveVersion(@PathVariable Long id) {
        outlineService.archiveVersion(id);
        return R.ok();
    }

    @PutMapping("/versions/{id}/restore")
    public R<Void> restoreVersion(@PathVariable Long id) {
        outlineService.restoreVersion(id);
        return R.ok();
    }
}
