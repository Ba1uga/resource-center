package com.baluga.backend.modules.storage.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InitUploadResponse {

    private Long assetId;
    private String uploadToken;
    private String uploadUrl;
}
