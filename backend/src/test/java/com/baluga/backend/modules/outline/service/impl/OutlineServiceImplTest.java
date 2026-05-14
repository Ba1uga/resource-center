package com.baluga.backend.modules.outline.service.impl;

import com.baluga.backend.modules.outline.dto.request.OutlineCreateCourseRequest;
import com.baluga.backend.modules.outline.dto.request.OutlineCreateVersionRequest;
import com.baluga.backend.modules.outline.dto.request.OutlineDuplicateVersionRequest;
import com.baluga.backend.modules.outline.dto.request.OutlineSaveVersionRequest;
import com.baluga.backend.modules.outline.dto.response.OutlineCourseVO;
import com.baluga.backend.modules.outline.entity.OutlineCourse;
import com.baluga.backend.modules.outline.entity.OutlineVersion;
import com.baluga.backend.modules.outline.mapper.OutlineCourseMapper;
import com.baluga.backend.modules.outline.mapper.OutlineVersionMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;


@ExtendWith(MockitoExtension.class)
class OutlineServiceImplTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private OutlineCourseMapper outlineCourseMapper;

    @Mock
    private OutlineVersionMapper outlineVersionMapper;

    private OutlineServiceImpl outlineService;

    private OutlineCourse calculusCourse;
    private OutlineCourse geometryCourse;
    private OutlineCourse statsCourse;
    private OutlineCourse newCourse;
    private OutlineVersion activeCalculusVersion;
    private OutlineVersion archivedCalculusVersion;
    private OutlineVersion collaboratorCalculusVersion;
    private OutlineVersion geometryVersion;
    private OutlineVersion statsVersion;

    @BeforeEach
    void setUp() throws Exception {
        outlineService = new OutlineServiceImpl(outlineCourseMapper, outlineVersionMapper, objectMapper);

        calculusCourse = OutlineCourse.builder()
                .id(1L)
                .title("函数与导数")
                .instructor("林知夏")
                .department("数学教研组")
                .deleted(0)
                .build();
        geometryCourse = OutlineCourse.builder()
                .id(2L)
                .title("立体几何")
                .instructor("林知夏")
                .department("数学教研组")
                .deleted(0)
                .build();
        statsCourse = OutlineCourse.builder()
                .id(3L)
                .title("概率与统计")
                .instructor("周晨")
                .department("统计教研组")
                .deleted(0)
                .build();
        newCourse = OutlineCourse.builder()
                .id(4L)
                .title("离散数学")
                .instructor("沈砚")
                .department("计算机教研组")
                .deleted(0)
                .build();

        activeCalculusVersion = OutlineVersion.builder()
                .id(1L)
                .courseId(1L)
                .versionName("2026 春版")
                .semester("2026春")
                .status("draft")
                .archiveState("active")
                .note("测试数据")
                .createdBy("林知夏")
                .updatedBy("林知夏")
                .sections(objectMapper.writeValueAsString(createSections("函数与导数")))
                .updatedAt(LocalDateTime.of(2026, 4, 10, 9, 30))
                .deleted(0)
                .build();

        archivedCalculusVersion = OutlineVersion.builder()
                .id(2L)
                .courseId(1L)
                .versionName("2025 秋统整版")
                .semester("2025秋")
                .status("final")
                .archiveState("archived")
                .archivedAt(LocalDateTime.of(2025, 12, 20, 10, 0))
                .note("归档测试数据")
                .createdBy("林知夏")
                .updatedBy("林知夏")
                .sections(objectMapper.writeValueAsString(createSections("函数与导数")))
                .updatedAt(LocalDateTime.of(2025, 9, 1, 10, 0))
                .deleted(0)
                .build();

        collaboratorCalculusVersion = OutlineVersion.builder()
                .id(3L)
                .courseId(1L)
                .versionName("2026 协作试验版")
                .semester("2026春")
                .status("draft")
                .archiveState("active")
                .note("协作测试数据")
                .createdBy("赵明远")
                .updatedBy("赵明远")
                .sections(objectMapper.writeValueAsString(createSections("函数与导数")))
                .updatedAt(LocalDateTime.of(2026, 4, 1, 9, 0))
                .deleted(0)
                .build();

        geometryVersion = OutlineVersion.builder()
                .id(4L)
                .courseId(2L)
                .versionName("2026 春版")
                .semester("2026春")
                .status("final")
                .archiveState("active")
                .note("立体几何测试数据")
                .createdBy("林知夏")
                .updatedBy("林知夏")
                .sections(objectMapper.writeValueAsString(createSections("立体几何")))
                .updatedAt(LocalDateTime.of(2026, 3, 25, 8, 20))
                .deleted(0)
                .build();

        statsVersion = OutlineVersion.builder()
                .id(5L)
                .courseId(3L)
                .versionName("2026 秋版")
                .semester("2026秋")
                .status("final")
                .archiveState("active")
                .note("概率与统计测试数据")
                .createdBy("周晨")
                .updatedBy("周晨")
                .sections(objectMapper.writeValueAsString(createSections("概率与统计")))
                .updatedAt(LocalDateTime.of(2026, 3, 12, 15, 20))
                .deleted(0)
                .build();
    }

    @Test
    void shouldListCoursesWithFilteredVersions() {
        when(outlineCourseMapper.selectList(any())).thenReturn(List.of(calculusCourse, geometryCourse, statsCourse));
        when(outlineVersionMapper.selectList(any())).thenReturn(List.of(activeCalculusVersion, collaboratorCalculusVersion, geometryVersion, statsVersion));

        List<OutlineCourseVO> result = outlineService.listCoursesWithVersions("", "", "", "active");

        assertEquals(3, result.size());
        assertEquals(4, result.stream().mapToInt(OutlineCourseVO::getVersionCount).sum());
        assertEquals("函数与导数", result.get(0).getTitle());
        assertEquals("2026 春版", result.get(0).getVersions().get(0).getVersionName());
        assertEquals("2026 协作试验版", result.get(0).getVersions().get(1).getVersionName());
    }

    @Test
    void shouldCreateBlankVersionWithEmptySections() throws Exception {
        OutlineCreateVersionRequest request = new OutlineCreateVersionRequest();
        request.setCourseId(3L);
        request.setVersionName("2027 春版");
        request.setSemester("2027春");
        request.setNote("空白测试");
        request.setCreatedBy("张老师");
        request.setUpdatedBy("张老师");

        when(outlineCourseMapper.selectById(3L)).thenReturn(statsCourse);
        doAnswer(invocation -> {
            OutlineVersion entity = invocation.getArgument(0);
            entity.setId(10L);
            return 1;
        }).when(outlineVersionMapper).insert(any(OutlineVersion.class));
        when(outlineVersionMapper.selectById(10L)).thenAnswer(invocation -> {
            OutlineVersion created = OutlineVersion.builder()
                    .id(10L)
                    .courseId(3L)
                    .versionName("2027 春版")
                    .semester("2027春")
                    .status("draft")
                    .archiveState("active")
                    .note("空白测试")
                    .createdBy("张老师")
                    .updatedBy("张老师")
                    .sections(objectMapper.writeValueAsString(createEmptySections()))
                    .build();
            created.setCourseTitle("概率与统计");
            return created;
        });

        OutlineVersion created = outlineService.createVersion(request);

        assertEquals("draft", created.getStatus());
        assertEquals("active", created.getArchiveState());
        assertEquals("张老师", created.getCreatedBy());
        assertEquals("概率与统计", created.getCourseTitle());
        assertTrue(objectMapper.readTree(created.getSections()).get("schedule").isArray());
        assertEquals(0, objectMapper.readTree(created.getSections()).get("schedule").size());
    }

    @Test
    void shouldCreateCourse() {
        OutlineCreateCourseRequest request = new OutlineCreateCourseRequest();
        request.setTitle("  数据结构  ");
        request.setInstructor("  张老师 ");
        request.setDepartment("  计算机教研组 ");

        doAnswer(invocation -> {
            OutlineCourse entity = invocation.getArgument(0);
            entity.setId(12L);
            return 1;
        }).when(outlineCourseMapper).insert(any(OutlineCourse.class));

        OutlineCourse created = outlineService.createCourse(request);
        OutlineCourseVO createdVo = OutlineCourseVO.fromEntity(created, List.of());

        assertEquals("数据结构", created.getTitle());
        assertEquals("张老师", created.getInstructor());
        assertEquals("计算机教研组", created.getDepartment());
        assertEquals(0, createdVo.getVersionCount());
    }

    @Test
    void shouldListCoursesWithZeroVersions() {
        when(outlineCourseMapper.selectList(any())).thenReturn(List.of(calculusCourse, newCourse));
        when(outlineVersionMapper.selectList(any())).thenReturn(List.of(activeCalculusVersion));

        List<OutlineCourseVO> result = outlineService.listCoursesWithVersions("", "", "", "active");

        assertEquals(2, result.size());
        assertEquals("离散数学", result.get(1).getTitle());
        assertEquals(0, result.get(1).getVersionCount());
        assertTrue(result.get(1).getVersions().isEmpty());
    }

    @Test
    void shouldSaveVersionAndReplaceSections() {
        ObjectNode sections = objectMapper.createObjectNode();
        ObjectNode basicInfo = sections.putObject("basicInfo");
        basicInfo.put("courseName", "函数与导数");
        basicInfo.put("credits", 6);
        basicInfo.put("hours", 64);
        basicInfo.put("instructor", "林知夏");
        basicInfo.putArray("majors").add("数学教育");
        sections.putArray("knowledgeGoals");
        sections.putArray("abilityGoals");
        sections.putArray("schedule");
        ObjectNode teachingMethods = sections.putObject("teachingMethods");
        teachingMethods.putArray("selected").add("讲授");
        teachingMethods.put("notes", "");
        ObjectNode assessment = sections.putObject("assessment");
        assessment.put("usualPercentage", 30);
        assessment.put("midtermPercentage", 20);
        assessment.put("finalPercentage", 50);
        assessment.putArray("usualItems");
        assessment.put("notes", "");
        ObjectNode materials = sections.putObject("materials");
        materials.putArray("primary");
        materials.putArray("references");

        OutlineSaveVersionRequest request = new OutlineSaveVersionRequest();
        request.setVersionName("2026 春版-更新");
        request.setSemester("2026春");
        request.setStatus("final");
        request.setNote("已保存");
        request.setUpdatedBy("林知夏");
        request.setSections(sections);

        when(outlineVersionMapper.selectById(1L)).thenReturn(activeCalculusVersion);
        when(outlineCourseMapper.selectById(1L)).thenReturn(calculusCourse);
        when(outlineVersionMapper.updateById(any(OutlineVersion.class))).thenReturn(1);
        when(outlineVersionMapper.selectById(1L)).thenAnswer(invocation -> activeCalculusVersion);

        OutlineVersion saved = outlineService.saveVersion(1L, request);

        assertEquals("2026 春版-更新", saved.getVersionName());
        assertEquals("final", saved.getStatus());
        assertEquals("函数与导数", saved.getCourseTitle());
        assertTrue(saved.getSections().contains("\"credits\":6"));
    }

    @Test
    void shouldDuplicateVersionFromSource() throws Exception {
        OutlineDuplicateVersionRequest request = new OutlineDuplicateVersionRequest();
        request.setCourseId(1L);
        request.setSourceVersionId(1L);
        request.setVersionName("副本-2026春");
        request.setSemester("2026秋");
        request.setNote("复制测试");
        request.setCreatedBy("林知夏");
        request.setUpdatedBy("林知夏");

        when(outlineCourseMapper.selectById(1L)).thenReturn(calculusCourse);
        when(outlineVersionMapper.selectById(1L)).thenReturn(activeCalculusVersion);
        doAnswer(invocation -> {
            OutlineVersion entity = invocation.getArgument(0);
            entity.setId(11L);
            return 1;
        }).when(outlineVersionMapper).insert(any(OutlineVersion.class));
        when(outlineVersionMapper.selectById(11L)).thenAnswer(invocation -> {
            OutlineVersion duplicated = OutlineVersion.builder()
                    .id(11L)
                    .courseId(1L)
                    .versionName("副本-2026春")
                    .semester("2026秋")
                    .status("draft")
                    .archiveState("active")
                    .note("复制测试")
                    .createdBy("林知夏")
                    .updatedBy("林知夏")
                    .sections(activeCalculusVersion.getSections())
                    .courseTitle("函数与导数")
                    .build();
            return duplicated;
        });

        OutlineVersion duplicated = outlineService.duplicateVersion(request);

        assertEquals("副本-2026春", duplicated.getVersionName());
        assertEquals("draft", duplicated.getStatus());
        assertEquals("active", duplicated.getArchiveState());
        assertEquals("函数与导数", duplicated.getCourseTitle());
        assertTrue(duplicated.getSections().contains("函数与导数"));
    }

    @Test
    void shouldArchiveAndRestoreVersion() {
        when(outlineVersionMapper.selectById(1L)).thenReturn(activeCalculusVersion);
        when(outlineVersionMapper.updateById(any(OutlineVersion.class))).thenReturn(1);

        outlineService.archiveVersion(1L);
        assertEquals("archived", activeCalculusVersion.getArchiveState());
        assertNotNull(activeCalculusVersion.getArchivedAt());

        outlineService.restoreVersion(1L);
        assertEquals("active", activeCalculusVersion.getArchiveState());
        assertNull(activeCalculusVersion.getArchivedAt());
    }

    @Test
    void shouldFillCourseTitleWhenLoadingSingleVersion() {
        when(outlineVersionMapper.selectById(5L)).thenReturn(statsVersion);
        when(outlineCourseMapper.selectById(3L)).thenReturn(statsCourse);

        OutlineVersion version = outlineService.getVersion(5L);

        assertEquals("概率与统计", version.getCourseTitle());
    }

    private Map<String, Object> createSections(String courseName) {
        return Map.of(
                "basicInfo", Map.of(
                        "courseName", courseName,
                        "credits", 4,
                        "hours", 64,
                        "instructor", "林知夏",
                        "majors", List.of("数学教育")
                ),
                "knowledgeGoals", List.of(),
                "abilityGoals", List.of(),
                "schedule", List.of(),
                "teachingMethods", Map.of("selected", List.of(), "notes", ""),
                "assessment", Map.of(
                        "usualPercentage", 0,
                        "midtermPercentage", 0,
                        "finalPercentage", 0,
                        "usualItems", List.of(),
                        "notes", ""
                ),
                "materials", Map.of(
                        "primary", List.of(),
                        "references", List.of()
                )
        );
    }

    private Map<String, Object> createEmptySections() {
        return Map.of(
                "basicInfo", Map.of(
                        "courseName", "",
                        "credits", 0,
                        "hours", 0,
                        "instructor", "",
                        "majors", List.of()
                ),
                "knowledgeGoals", List.of(),
                "abilityGoals", List.of(),
                "schedule", List.of(),
                "teachingMethods", Map.of("selected", List.of(), "notes", ""),
                "assessment", Map.of(
                        "usualPercentage", 0,
                        "midtermPercentage", 0,
                        "finalPercentage", 0,
                        "usualItems", List.of(),
                        "notes", ""
                ),
                "materials", Map.of(
                        "primary", List.of(),
                        "references", List.of()
                )
        );
    }
}
