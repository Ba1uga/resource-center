package com.baluga.backend.modules.textbook.dto.request;

import jakarta.validation.constraints.Min;
import lombok.Data;


@Data
public class TextbookPageRequest {

    private String keyword;

    private String course;

    @Min(value = 1, message = "页码必须大于等于 1")
    private Integer page = 1;

    @Min(value = 1, message = "每页条数必须大于等于 1")
    private Integer pageSize = 10;
}
