package com.baluga.backend.modules.courseware.dto.request;

import jakarta.validation.constraints.Min;
import lombok.Data;


@Data
public class CoursewarePageRequest {

    private String keyword;

    private String course;

    private String type;

    @Min(value = 1, message = "页码必须大于等于 1")
    private Integer page = 1;

    @Min(value = 1, message = "每页条数必须大于等于 1")
    private Integer pageSize = 10;
}