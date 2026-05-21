package com.baluga.backend.modules.mapping.dto.request;

import jakarta.validation.constraints.Min;
import lombok.Data;


@Data
public class MappingRecordPageRequest {

    private String keyword;

    private String resourceType;

    private String course;

    private String chapter;

    private String batchId;

    private String reviewStatus;

    private String confidenceLevel;

    private String overviewStatus;

    @Min(value = 1, message = "页码必须大于等于 1")
    private Integer page = 1;

    @Min(value = 1, message = "每页条数必须大于等于 1")
    private Integer pageSize = 10;
}
