package com.baluga.backend.modules.question.dto.response;

import com.baluga.backend.modules.question.entity.Question;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionVO {

    private Long id;

    private String type;

    private String subjectId;

    private String chapterId;

    private String difficulty;

    private String status;

    private String stem;

    private String knowledgePoint;

    private String analysis;

    private Object content;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Shanghai")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Shanghai")
    private LocalDateTime updatedAt;

    public static QuestionVO fromEntity(Question question, ObjectMapper objectMapper) {
        Object parsedContent = null;
        if (question.getContent() != null) {
            try {
                parsedContent = objectMapper.readValue(question.getContent(), Object.class);
            } catch (JsonProcessingException ignored) {
                parsedContent = question.getContent();
            }
        }

        return QuestionVO.builder()
                .id(question.getId())
                .type(question.getType())
                .subjectId(question.getSubjectId())
                .chapterId(question.getChapterId())
                .difficulty(question.getDifficulty())
                .status(question.getStatus())
                .stem(question.getStem())
                .knowledgePoint(question.getKnowledgePoint())
                .analysis(question.getAnalysis())
                .content(parsedContent)
                .createdAt(question.getCreatedAt())
                .updatedAt(question.getUpdatedAt())
                .build();
    }
}