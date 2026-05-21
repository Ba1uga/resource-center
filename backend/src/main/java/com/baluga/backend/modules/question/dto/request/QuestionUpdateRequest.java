package com.baluga.backend.modules.question.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;


@Data
public class QuestionUpdateRequest {

    @NotBlank(message = "请填写题型")
    private String type;

    @NotBlank(message = "请选择学科")
    private String subjectId;

    @NotBlank(message = "请选择章节")
    private String chapterId;

    @NotBlank(message = "请选择难度")
    private String difficulty;

    @NotBlank(message = "请填写状态")
    private String status;

    @NotBlank(message = "请填写题干")
    private String stem;

    private String knowledgePoint = "";

    private String analysis = "";

    @NotNull(message = "请填写题型内容")
    private Object content;
}