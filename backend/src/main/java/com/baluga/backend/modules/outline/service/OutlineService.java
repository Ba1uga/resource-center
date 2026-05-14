package com.baluga.backend.modules.outline.service;

import com.baluga.backend.modules.outline.dto.request.OutlineCreateVersionRequest;
import com.baluga.backend.modules.outline.dto.request.OutlineDuplicateVersionRequest;
import com.baluga.backend.modules.outline.dto.request.OutlineSaveVersionRequest;
import com.baluga.backend.modules.outline.dto.response.OutlineCourseVO;
import com.baluga.backend.modules.outline.entity.OutlineVersion;

import java.util.List;


public interface OutlineService {

    List<OutlineCourseVO> listCoursesWithVersions(String keyword, String semester, String versionStatus, String archiveState);

    OutlineVersion getVersion(Long versionId);

    OutlineVersion createVersion(OutlineCreateVersionRequest request);

    OutlineVersion saveVersion(Long versionId, OutlineSaveVersionRequest request);

    OutlineVersion duplicateVersion(OutlineDuplicateVersionRequest request);

    void archiveVersion(Long versionId);

    void restoreVersion(Long versionId);
}
