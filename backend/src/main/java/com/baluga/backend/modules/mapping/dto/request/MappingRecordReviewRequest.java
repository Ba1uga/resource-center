package com.baluga.backend.modules.mapping.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;


@Data
public class MappingRecordReviewRequest {

    @NotBlank(message = "请指定操作类型")
    private String action;
}
