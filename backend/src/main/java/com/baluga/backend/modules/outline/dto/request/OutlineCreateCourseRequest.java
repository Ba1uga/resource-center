package com.baluga.backend.modules.outline.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;


@Data
public class OutlineCreateCourseRequest {

    @NotBlank(message = "请填写课程名称")
    private String title;

    @NotBlank(message = "请填写授课教师")
    private String instructor;

    @NotBlank(message = "请填写教研室")
    private String department;
}
