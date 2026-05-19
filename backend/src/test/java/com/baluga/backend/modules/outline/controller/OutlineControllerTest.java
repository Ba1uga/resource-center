package com.baluga.backend.modules.outline.controller;

import com.baluga.backend.common.exception.GlobalExceptionHandler;
import com.baluga.backend.modules.outline.service.OutlineService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

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
}
