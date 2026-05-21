package com.baluga.backend.modules.courseware.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;


@Data
public class CoursewareUpdateRequest {

    @NotBlank(message = "请填写课件标题")
    private String title;

    @NotBlank(message = "请填写课程")
    private String course;

    @NotBlank(message = "请填写章节")
    private String chapter;

    @NotBlank(message = "请选择课件类型")
    private String type;

    @NotBlank(message = "请填写文件大小")
    private String fileSize;
}