package com.baluga.backend.modules.mapping.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;


@Data
public class MappingBatchCreateRequest {

    @NotBlank(message = "请填写批次标签")
    private String label;

    private String course;

    private String resourceType;

    private String createdBy = "";
}
