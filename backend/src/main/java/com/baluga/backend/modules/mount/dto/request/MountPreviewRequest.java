package com.baluga.backend.modules.mount.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;


public class MountPreviewRequest {

    @NotBlank
    private String resourceType;

    @NotNull
    private Long resourceId;

    /** Optional: pre-selected course to narrow scope */
    private String course;

    public String getResourceType() { return resourceType; }
    public void setResourceType(String v) { this.resourceType = v; }

    public Long getResourceId() { return resourceId; }
    public void setResourceId(Long v) { this.resourceId = v; }

    public String getCourse() { return course; }
    public void setCourse(String v) { this.course = v; }
}
