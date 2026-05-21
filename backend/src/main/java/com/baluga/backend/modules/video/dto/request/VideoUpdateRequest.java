package com.baluga.backend.modules.video.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;


@Data
public class VideoUpdateRequest {

    @NotBlank(message = "请填写视频标题")
    private String title;

    @NotBlank(message = "请填写所属课程")
    private String course;

    @NotBlank(message = "请填写所属章节")
    private String chapter;

    private String duration = "00:00";

    private String resolution = "1080p";

    private Integer viewCount = 0;

    private String fileSize = "";

    private String knowledgePoint = "";

    private List<String> tags = List.of();

    private String description = "";

    private String processingStatus = "ready";

    private String publishStatus = "draft";

    private String visibility = "students";

    private String scheduledPublishAt;
}
