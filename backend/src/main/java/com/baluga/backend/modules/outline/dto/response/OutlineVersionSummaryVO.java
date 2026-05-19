package com.baluga.backend.modules.outline.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OutlineVersionSummaryVO {

    private Long id;

    private Long courseId;

    private String versionName;

    private String semester;

    private String status;

    private String archiveState;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Shanghai")
    private LocalDateTime archivedAt;

    private String note;

    private String updatedBy;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Shanghai")
    private LocalDateTime updatedAt;

    private Integer completionPercent;

    private Integer completionIssueCount;

    private String completionState;
}
