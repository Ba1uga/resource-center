package com.baluga.backend.modules.outline.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;


@Data
@EqualsAndHashCode(callSuper = true)
public class OutlineDuplicateVersionRequest extends OutlineCreateVersionRequest {

    @NotNull(message = "请选择待复制版本")
    private Long sourceVersionId;
}
