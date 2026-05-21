package com.baluga.backend.modules.question.dto.request;

import jakarta.validation.constraints.Min;
import lombok.Data;


@Data
public class QuestionPageRequest {

    private String subjectId;

    private String chapterId;

    private String type;

    private String difficulty;

    private String keyword;

    @Min(value = 1, message = "页码必须大于等于 1")
    private Integer page = 1;

    @Min(value = 1, message = "每页条数必须大于等于 1")
    private Integer pageSize = 10;
}