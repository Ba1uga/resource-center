package com.baluga.backend.modules.mount.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;


public class CreateMountTaskRequest {

    @NotBlank
    private String taskType;

    private String resourceType;

    private Long resourceId;

    private Long batchId;

    @NotNull
    private Integer priority = 5;

    public String getTaskType() { return taskType; }
    public void setTaskType(String v) { this.taskType = v; }

    public String getResourceType() { return resourceType; }
    public void setResourceType(String v) { this.resourceType = v; }

    public Long getResourceId() { return resourceId; }
    public void setResourceId(Long v) { this.resourceId = v; }

    public Long getBatchId() { return batchId; }
    public void setBatchId(Long v) { this.batchId = v; }

    public Integer getPriority() { return priority; }
    public void setPriority(Integer v) { this.priority = v; }
}
