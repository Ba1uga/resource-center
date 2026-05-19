package com.baluga.backend.modules.textbook.controller;

import com.baluga.backend.common.exception.GlobalExceptionHandler;
import com.baluga.backend.modules.textbook.service.TextbookService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TextbookController.class)
@Import(GlobalExceptionHandler.class)
class TextbookControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TextbookService textbookService;

    @Test
    void getTextbookReturnsNotFoundStatusWhenResourceMissing() throws Exception {
        when(textbookService.getById(999L)).thenReturn(null);

        mockMvc.perform(get("/api/textbooks/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(404))
                .andExpect(jsonPath("$.message").value("教材不存在"));
    }

    @Test
    void updateTextbookReturnsNotFoundStatusWhenResourceMissing() throws Exception {
        when(textbookService.getById(999L)).thenReturn(null);

        mockMvc.perform(put("/api/textbooks/999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "高等数学",
                                  "author": "林知夏",
                                  "publisher": "教育出版社",
                                  "edition": "第三版",
                                  "isbn": "1234567890",
                                  "course": "高等数学"
                                }
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(404))
                .andExpect(jsonPath("$.message").value("教材不存在"));
    }

    @Test
    void deleteTextbookReturnsNotFoundStatusWhenResourceMissing() throws Exception {
        when(textbookService.getById(999L)).thenReturn(null);

        mockMvc.perform(delete("/api/textbooks/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(404))
                .andExpect(jsonPath("$.message").value("教材不存在"));
    }
}
