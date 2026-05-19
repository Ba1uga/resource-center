package com.baluga.backend.modules.outline.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baluga.backend.common.exception.GlobalExceptionHandler;
import com.baluga.backend.modules.outline.dto.request.OutlineListRequest;
import com.baluga.backend.modules.outline.dto.response.OutlineCourseSummaryVO;
import com.baluga.backend.modules.outline.dto.response.OutlineVersionSummaryVO;
import com.baluga.backend.modules.outline.service.OutlineService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OutlineController.class)
@Import(GlobalExceptionHandler.class)
class OutlineControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private OutlineService outlineService;

    @Test
    void getVersionReturnsNotFoundStatusWhenResourceMissing() throws Exception {
        when(outlineService.getVersion(999L)).thenReturn(null);

        mockMvc.perform(get("/api/outline/versions/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(404))
                .andExpect(jsonPath("$.message").value("大纲版本不存在"));
    }

    @Test
    void listCoursesReturnsPagedCourseSummaries() throws Exception {
        Page<OutlineCourseSummaryVO> page = new Page<>(2, 10, 21);
        page.setRecords(List.of(
                OutlineCourseSummaryVO.builder()
                        .id(1L)
                        .title("函数与导数")
                        .instructor("林知夏")
                        .department("数学教研组")
                        .matchedVersionCount(2)
                        .totalVersionCount(3)
                        .build()
        ));

        when(outlineService.pageCourseSummaries(any(OutlineListRequest.class))).thenReturn(page);

        mockMvc.perform(get("/api/outline/courses")
                        .param("keyword", "函数")
                        .param("completionState", "nearly-complete")
                        .param("page", "2")
                        .param("pageSize", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.current").value(2))
                .andExpect(jsonPath("$.data.size").value(10))
                .andExpect(jsonPath("$.data.total").value(21))
                .andExpect(jsonPath("$.data.records[0].matchedVersionCount").value(2))
                .andExpect(jsonPath("$.data.records[0].totalVersionCount").value(3));
    }

    @Test
    void listCourseVersionsReturnsPagedVersionSummaries() throws Exception {
        Page<OutlineVersionSummaryVO> page = new Page<>(1, 20, 2);
        page.setRecords(List.of(
                OutlineVersionSummaryVO.builder()
                        .id(1L)
                        .courseId(1L)
                        .versionName("2026 春版")
                        .semester("2026春")
                        .status("draft")
                        .archiveState("active")
                        .completionPercent(83)
                        .completionIssueCount(1)
                        .completionState("nearly-complete")
                        .updatedBy("林知夏")
                        .build()
        ));

        when(outlineService.pageCourseVersions(eq(1L), any(OutlineListRequest.class))).thenReturn(page);

        mockMvc.perform(get("/api/outline/courses/1/versions")
                        .param("keyword", "函数")
                        .param("archiveState", "active")
                        .param("page", "1")
                        .param("pageSize", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.records[0].versionName").value("2026 春版"))
                .andExpect(jsonPath("$.data.records[0].completionPercent").value(83))
                .andExpect(jsonPath("$.data.records[0].completionState").value("nearly-complete"));
    }
}
