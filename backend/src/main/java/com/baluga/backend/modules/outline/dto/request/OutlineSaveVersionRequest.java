package com.baluga.backend.modules.outline.dto.request;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;


@Data
public class OutlineSaveVersionRequest {

    @NotBlank(message = "请填写版本名称")
    private String versionName;

    @NotBlank(message = "请填写学期")
    private String semester;

    private String status;

    private String note;

    @NotBlank(message = "请填写最近修改人")
    private String updatedBy;

    @NotNull(message = "请提交完整大纲内容")
    private JsonNode sections;
}
