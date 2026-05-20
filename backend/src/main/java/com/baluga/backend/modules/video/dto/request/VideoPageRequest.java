package com.baluga.backend.modules.video.dto.request;

import jakarta.validation.constraints.Min;
import lombok.Data;


@Data
public class VideoPageRequest {

    private String keyword;

    private String course;

    private String chapter;

    private String processingStatus;

    private String publishStatus;

    private String uploadedBy;

    private String uploadedFrom;

    private String uploadedTo;

    @Min(value = 1, message = "页码必须大于等于 1")
    private Integer page = 1;

    @Min(value = 1, message = "每页条数必须大于等于 1")
    private Integer pageSize = 10;
}