package com.baluga.backend.modules.mount.dto;

import java.util.List;


public class ResourceContext {

    private Long resourceId;
    private String resourceType;
    private String title;
    private String course;
    private String chapter;
    private String fullText;
    private List<String> chunkTexts;

    public ResourceContext() {}

    public ResourceContext(Long resourceId, String resourceType, String title,
                           String course, String chapter, String fullText) {
        this.resourceId = resourceId;
        this.resourceType = resourceType;
        this.title = title;
        this.course = course;
        this.chapter = chapter;
        this.fullText = fullText;
    }

    public Long getResourceId() { return resourceId; }
    public void setResourceId(Long v) { this.resourceId = v; }

    public String getResourceType() { return resourceType; }
    public void setResourceType(String v) { this.resourceType = v; }

    public String getTitle() { return title; }
    public void setTitle(String v) { this.title = v; }

    public String getCourse() { return course; }
    public void setCourse(String v) { this.course = v; }

    public String getChapter() { return chapter; }
    public void setChapter(String v) { this.chapter = v; }

    public String getFullText() { return fullText; }
    public void setFullText(String v) { this.fullText = v; }

    public List<String> getChunkTexts() { return chunkTexts; }
    public void setChunkTexts(List<String> v) { this.chunkTexts = v; }

    public String contentSnippet(int maxLen) {
        if (fullText == null || fullText.isEmpty()) return "";
        return fullText.length() > maxLen ? fullText.substring(0, maxLen) : fullText;
    }
}
