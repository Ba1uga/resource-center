package com.baluga.backend.modules.outline.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baluga.backend.modules.outline.dto.request.OutlineCreateCourseRequest;
import com.baluga.backend.modules.outline.dto.request.OutlineCreateVersionRequest;
import com.baluga.backend.modules.outline.dto.request.OutlineDuplicateVersionRequest;
import com.baluga.backend.modules.outline.dto.request.OutlineListRequest;
import com.baluga.backend.modules.outline.dto.request.OutlineSaveVersionRequest;
import com.baluga.backend.modules.outline.dto.response.OutlineCourseVO;
import com.baluga.backend.modules.outline.dto.response.OutlineCourseSummaryVO;
import com.baluga.backend.modules.outline.dto.response.OutlineVersionSummaryVO;
import com.baluga.backend.modules.outline.entity.OutlineCourse;
import com.baluga.backend.modules.outline.entity.OutlineVersion;

import java.util.List;


public interface OutlineService {

    List<OutlineCourseVO> listCoursesWithVersions(String keyword, String semester, String versionStatus, String archiveState);

    Page<OutlineCourseSummaryVO> pageCourseSummaries(OutlineListRequest request);

    Page<OutlineVersionSummaryVO> pageCourseVersions(Long courseId, OutlineListRequest request);

    OutlineVersion getVersion(Long versionId);

    OutlineCourse createCourse(OutlineCreateCourseRequest request);

    OutlineVersion createVersion(OutlineCreateVersionRequest request);

    OutlineVersion saveVersion(Long versionId, OutlineSaveVersionRequest request);

    OutlineVersion duplicateVersion(OutlineDuplicateVersionRequest request);

    void archiveVersion(Long versionId);

    void restoreVersion(Long versionId);
}
