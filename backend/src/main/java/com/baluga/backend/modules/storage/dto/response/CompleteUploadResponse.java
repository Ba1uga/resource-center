package com.baluga.backend.modules.storage.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompleteUploadResponse {

    private Long assetId;
    private String objectKey;
    private String originName;
    private String mimeType;
    private Long sizeBytes;
    private String sha256;
    private String uploadStatus;
}
