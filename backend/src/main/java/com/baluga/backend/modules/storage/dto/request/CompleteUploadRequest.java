package com.baluga.backend.modules.storage.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;


@Data
public class CompleteUploadRequest {

    @NotBlank(message = "上传令牌不能为空")
    private String uploadToken;
}
