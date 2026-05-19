package com.baluga.backend.modules.outline.dto.response;

import com.baluga.backend.modules.outline.entity.OutlineVersion;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OutlineVersionVO {

    private Long id;

    private Long courseId;

    private String courseTitle;

    private String versionName;

    private String semester;

    private String status;

    private String archiveState;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Shanghai")
    private LocalDateTime archivedAt;

    private String note;

    private String createdBy;

    private String updatedBy;

    private Object sections;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Shanghai")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Shanghai")
    private LocalDateTime updatedAt;

    private Integer completionPercent;

    private Integer completionIssueCount;

    private String completionState;

    public static OutlineVersionVO fromEntity(OutlineVersion version, String courseTitle, ObjectMapper objectMapper) {
        JsonNode sectionsNode;
        try {
            sectionsNode = objectMapper.readTree(version.getSections());
        } catch (Exception ex) {
            throw new IllegalStateException("大纲内容解析失败", ex);
        }

        return OutlineVersionVO.builder()
                .id(version.getId())
                .courseId(version.getCourseId())
                .courseTitle(courseTitle)
                .versionName(version.getVersionName())
                .semester(version.getSemester())
                .status(version.getStatus())
                .archiveState(version.getArchiveState())
                .archivedAt(version.getArchivedAt())
                .note(version.getNote())
                .createdBy(version.getCreatedBy())
                .updatedBy(version.getUpdatedBy())
                .sections(sectionsNode)
                .createdAt(version.getCreatedAt())
                .updatedAt(version.getUpdatedAt())
                .completionPercent(version.getCompletionPercent())
                .completionIssueCount(version.getCompletionIssueCount())
                .completionState(version.getCompletionState())
                .build();
    }
}
