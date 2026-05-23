package com.baluga.backend.modules.storage.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;


@Data
public class InitUploadRequest {

    @NotBlank(message = "模块类型不能为空")
    private String moduleType;

    @NotBlank(message = "文件名不能为空")
    private String originName;

    @NotBlank(message = "MIME类型不能为空")
    private String mimeType;

    @NotNull(message = "文件大小不能为空")
    @Positive(message = "文件大小必须为正数")
    private Long sizeBytes;

    private String groupToken;
}
