package com.baluga.backend.modules.outline.dto.request;

import lombok.Data;
import org.springframework.util.StringUtils;


@Data
public class OutlineListRequest {

    private String keyword;

    private String semester;

    private String versionStatus;

    private String completionState;

    private String archiveState = "active";

    private Integer page = 1;

    private Integer pageSize = 10;

    public boolean isVersionFilterActive() {
        return StringUtils.hasText(semester)
                || StringUtils.hasText(versionStatus)
                || StringUtils.hasText(completionState)
                || (StringUtils.hasText(archiveState) && !"all".equals(archiveState));
    }

    public long safePage() {
        return page != null && page > 0 ? page : 1L;
    }

    public long safePageSize() {
        return pageSize != null && pageSize > 0 ? pageSize : 10L;
    }
}
