package com.baluga.backend.modules.video.dto.response;

import com.baluga.backend.modules.video.entity.Video;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoVO {

    private Long id;

    private String title;

    private String course;

    private String chapter;

    private String duration;

    private String resolution;

    private Integer viewCount;

    private String uploadedBy;

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Shanghai")
    private java.time.LocalDate uploadedAt;

    private String fileSize;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Shanghai")
    private LocalDateTime lastEditedAt;

    private String coverLabel;

    private String knowledgePoint;

    private List<String> tags;

    private String description;

    private String processingStatus;

    private String publishStatus;

    private String resourceAlert;

    private String visibility;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Shanghai")
    private LocalDateTime scheduledPublishAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Shanghai")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Shanghai")
    private LocalDateTime updatedAt;

    public static VideoVO fromEntity(Video video, ObjectMapper objectMapper) {
        List<String> parsedTags = Collections.emptyList();
        if (video.getTags() != null) {
            try {
                parsedTags = objectMapper.readValue(video.getTags(), new TypeReference<List<String>>() {});
            } catch (JsonProcessingException ignored) {
                parsedTags = Collections.emptyList();
            }
        }

        return VideoVO.builder()
                .id(video.getId())
                .title(video.getTitle())
                .course(video.getCourse())
                .chapter(video.getChapter())
                .duration(video.getDuration())
                .resolution(video.getResolution())
                .viewCount(video.getViewCount())
                .uploadedBy(video.getUploadedBy())
                .uploadedAt(video.getUploadedAt())
                .fileSize(video.getFileSize())
                .lastEditedAt(video.getLastEditedAt())
                .coverLabel(video.getCoverLabel())
                .knowledgePoint(video.getKnowledgePoint())
                .tags(parsedTags)
                .description(video.getDescription())
                .processingStatus(video.getProcessingStatus())
                .publishStatus(video.getPublishStatus())
                .resourceAlert(video.getResourceAlert())
                .visibility(video.getVisibility())
                .scheduledPublishAt(video.getScheduledPublishAt())
                .createdAt(video.getCreatedAt())
                .updatedAt(video.getUpdatedAt())
                .build();
    }
}