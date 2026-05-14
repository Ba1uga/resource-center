package com.baluga.backend.modules.outline.dto.request;

import lombok.Data;


@Data
public class OutlineListRequest {

    private String keyword;

    private String semester;

    private String versionStatus;

    private String archiveState = "active";
}
