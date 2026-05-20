package com.baluga.backend.modules.outline.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;


@Data
public class OutlineCreateVersionRequest {

    @NotNull(message = "请选择课程")
    private Long courseId;

    @NotBlank(message = "请填写版本名称")
    private String versionName;

    @NotBlank(message = "请填写学期")
    private String semester;

    private String note;

    @NotBlank(message = "请填写创建人")
    private String createdBy;

    private String updatedBy;
}
