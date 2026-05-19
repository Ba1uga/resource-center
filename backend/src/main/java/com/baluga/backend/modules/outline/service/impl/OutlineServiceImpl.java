package com.baluga.backend.modules.outline.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baluga.backend.modules.outline.dto.request.OutlineCreateCourseRequest;
import com.baluga.backend.modules.outline.dto.request.OutlineCreateVersionRequest;
import com.baluga.backend.modules.outline.dto.request.OutlineDuplicateVersionRequest;
import com.baluga.backend.modules.outline.dto.request.OutlineSaveVersionRequest;
import com.baluga.backend.modules.outline.dto.response.OutlineCourseVO;
import com.baluga.backend.modules.outline.dto.response.OutlineVersionVO;
import com.baluga.backend.modules.outline.entity.OutlineCourse;
import com.baluga.backend.modules.outline.entity.OutlineVersion;
import com.baluga.backend.modules.outline.mapper.OutlineCourseMapper;
import com.baluga.backend.modules.outline.mapper.OutlineVersionMapper;
import com.baluga.backend.modules.outline.service.OutlineService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class OutlineServiceImpl implements OutlineService {

    private final OutlineCourseMapper outlineCourseMapper;
    private final OutlineVersionMapper outlineVersionMapper;
    private final ObjectMapper objectMapper;
    private final OutlineCompletionSnapshotCalculator completionSnapshotCalculator;

    @Override
    public List<OutlineCourseVO> listCoursesWithVersions(String keyword, String semester, String versionStatus, String archiveState) {
        String normalizedKeyword = normalize(keyword);
        String normalizedSemester = normalize(semester);
        String normalizedStatus = normalize(versionStatus);
        String normalizedArchiveState = StringUtils.hasText(normalize(archiveState)) ? normalize(archiveState) : "active";

        LambdaQueryWrapper<OutlineCourse> courseQuery = Wrappers.lambdaQuery();
        if (StringUtils.hasText(normalizedKeyword)) {
            courseQuery.and(wrapper -> wrapper.like(OutlineCourse::getTitle, normalizedKeyword)
                    .or()
                    .like(OutlineCourse::getInstructor, normalizedKeyword));
        }
        courseQuery.orderByAsc(OutlineCourse::getId);

        List<OutlineCourse> courses = outlineCourseMapper.selectList(courseQuery);
        if (courses.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> courseIds = courses.stream().map(OutlineCourse::getId).toList();
        LambdaQueryWrapper<OutlineVersion> versionQuery = Wrappers.lambdaQuery();
        versionQuery.in(OutlineVersion::getCourseId, courseIds);

        if (StringUtils.hasText(normalizedSemester)) {
            versionQuery.eq(OutlineVersion::getSemester, normalizedSemester);
        }
        if (StringUtils.hasText(normalizedStatus)) {
            versionQuery.eq(OutlineVersion::getStatus, normalizedStatus);
        }
        if (StringUtils.hasText(normalizedArchiveState) && !"all".equals(normalizedArchiveState)) {
            versionQuery.eq(OutlineVersion::getArchiveState, normalizedArchiveState);
        }
        versionQuery.orderByDesc(OutlineVersion::getUpdatedAt).orderByDesc(OutlineVersion::getId);

        List<OutlineVersion> versions = outlineVersionMapper.selectList(versionQuery);
        Map<Long, List<OutlineVersion>> versionsByCourseId = versions.stream()
                .collect(Collectors.groupingBy(OutlineVersion::getCourseId, LinkedHashMap::new, Collectors.toList()));

        return courses.stream()
                .map(course -> {
                    List<OutlineVersionVO> versionVos = versionsByCourseId.getOrDefault(course.getId(), Collections.emptyList())
                            .stream()
                            .map(version -> OutlineVersionVO.fromEntity(version, course.getTitle(), objectMapper))
                            .toList();
                    return OutlineCourseVO.fromEntity(course, versionVos);
                })
                .toList();
    }

    @Override
    public OutlineVersion getVersion(Long versionId) {
        return fillCourseTitle(outlineVersionMapper.selectById(versionId));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OutlineCourse createCourse(OutlineCreateCourseRequest request) {
        OutlineCourse course = OutlineCourse.builder()
                .title(normalize(request.getTitle()))
                .instructor(normalize(request.getInstructor()))
                .department(normalize(request.getDepartment()))
                .deleted(0)
                .build();

        outlineCourseMapper.insert(course);
        return course;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OutlineVersion createVersion(OutlineCreateVersionRequest request) {
        OutlineCourse course = outlineCourseMapper.selectById(request.getCourseId());
        if (course == null) {
            throw new IllegalArgumentException("课程不存在");
        }

        String operator = StringUtils.hasText(normalize(request.getUpdatedBy()))
                ? normalize(request.getUpdatedBy())
                : normalize(request.getCreatedBy());

        OutlineVersion version = OutlineVersion.builder()
                .courseId(request.getCourseId())
                .versionName(normalize(request.getVersionName()))
                .semester(normalize(request.getSemester()))
                .status("draft")
                .archiveState("active")
                .archivedAt(null)
                .note(defaultString(request.getNote()))
                .createdBy(normalize(request.getCreatedBy()))
                .updatedBy(operator)
                .sections(writeJson(createEmptySections()))
                .deleted(0)
                .build();

        applyCompletionSnapshot(version);
        outlineVersionMapper.insert(version);
        return fillCourseTitle(outlineVersionMapper.selectById(version.getId()));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OutlineVersion saveVersion(Long versionId, OutlineSaveVersionRequest request) {
        OutlineVersion version = requireVersion(versionId);

        version.setVersionName(normalize(request.getVersionName()));
        version.setSemester(normalize(request.getSemester()));
        version.setStatus(StringUtils.hasText(normalize(request.getStatus())) ? normalize(request.getStatus()) : "draft");
        version.setNote(defaultString(request.getNote()));
        version.setUpdatedBy(normalize(request.getUpdatedBy()));
        version.setSections(writeJson(request.getSections()));

        applyCompletionSnapshot(version);
        outlineVersionMapper.updateById(version);
        return fillCourseTitle(outlineVersionMapper.selectById(versionId));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OutlineVersion duplicateVersion(OutlineDuplicateVersionRequest request) {
        OutlineCourse course = outlineCourseMapper.selectById(request.getCourseId());
        if (course == null) {
            throw new IllegalArgumentException("课程不存在");
        }

        OutlineVersion sourceVersion = requireVersion(request.getSourceVersionId());
        if (!request.getCourseId().equals(sourceVersion.getCourseId())) {
            throw new IllegalArgumentException("源版本不属于当前课程");
        }

        String operator = StringUtils.hasText(normalize(request.getUpdatedBy()))
                ? normalize(request.getUpdatedBy())
                : normalize(request.getCreatedBy());

        OutlineVersion duplicatedVersion = OutlineVersion.builder()
                .courseId(request.getCourseId())
                .versionName(normalize(request.getVersionName()))
                .semester(normalize(request.getSemester()))
                .status("draft")
                .archiveState("active")
                .archivedAt(null)
                .note(defaultString(request.getNote()))
                .createdBy(normalize(request.getCreatedBy()))
                .updatedBy(operator)
                .sections(sourceVersion.getSections())
                .deleted(0)
                .build();

        applyCompletionSnapshot(duplicatedVersion);
        outlineVersionMapper.insert(duplicatedVersion);
        return fillCourseTitle(outlineVersionMapper.selectById(duplicatedVersion.getId()));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void archiveVersion(Long versionId) {
        OutlineVersion version = requireVersion(versionId);
        version.setArchiveState("archived");
        version.setArchivedAt(LocalDateTime.now());
        outlineVersionMapper.updateById(version);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void restoreVersion(Long versionId) {
        OutlineVersion version = requireVersion(versionId);
        version.setArchiveState("active");
        version.setArchivedAt(null);
        outlineVersionMapper.updateById(version);
    }

    private OutlineVersion requireVersion(Long versionId) {
        OutlineVersion version = outlineVersionMapper.selectById(versionId);
        if (version == null) {
            throw new IllegalArgumentException("大纲版本不存在");
        }
        return version;
    }

    private void applyCompletionSnapshot(OutlineVersion version) {
        OutlineCompletionSnapshot snapshot = completionSnapshotCalculator.calculate(version.getSections());
        version.setCompletionPercent(snapshot.completionPercent());
        version.setCompletionIssueCount(snapshot.completionIssueCount());
        version.setCompletionState(snapshot.completionState());
    }

    private OutlineVersion fillCourseTitle(OutlineVersion version) {
        if (version == null) {
            return null;
        }
        if (!StringUtils.hasText(version.getCourseTitle()) && version.getCourseId() != null) {
            OutlineCourse course = outlineCourseMapper.selectById(version.getCourseId());
            if (course != null) {
                version.setCourseTitle(course.getTitle());
            }
        }
        return version;
    }

    private Map<String, Object> createEmptySections() {
        Map<String, Object> sections = new LinkedHashMap<>();

        Map<String, Object> basicInfo = new LinkedHashMap<>();
        basicInfo.put("courseName", "");
        basicInfo.put("credits", 0);
        basicInfo.put("hours", 0);
        basicInfo.put("instructor", "");
        basicInfo.put("majors", List.of());

        Map<String, Object> teachingMethods = new LinkedHashMap<>();
        teachingMethods.put("selected", List.of());
        teachingMethods.put("notes", "");

        Map<String, Object> assessment = new LinkedHashMap<>();
        assessment.put("usualPercentage", 0);
        assessment.put("midtermPercentage", 0);
        assessment.put("finalPercentage", 0);
        assessment.put("usualItems", List.of());
        assessment.put("notes", "");

        Map<String, Object> materials = new LinkedHashMap<>();
        materials.put("primary", List.of());
        materials.put("references", List.of());

        sections.put("basicInfo", basicInfo);
        sections.put("knowledgeGoals", List.of());
        sections.put("abilityGoals", List.of());
        sections.put("schedule", List.of());
        sections.put("teachingMethods", teachingMethods);
        sections.put("assessment", assessment);
        sections.put("materials", materials);
        return sections;
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception ex) {
            throw new IllegalStateException("大纲内容序列化失败", ex);
        }
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private String defaultString(String value) {
        return value == null ? "" : value.trim();
    }
}
