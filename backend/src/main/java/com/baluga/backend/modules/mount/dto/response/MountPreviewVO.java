package com.baluga.backend.modules.mount.dto.response;

import com.baluga.backend.modules.mount.dto.MountDecision;

import java.util.List;
import java.util.Map;


public class MountPreviewVO {

    private Long resourceId;
    private String resourceType;
    private String resourceTitle;
    private List<MountDecision> courseMatches;
    private List<MountDecision> chapterMatches;
    private List<MountDecision> knowledgePointMatches;
    private Map<String, Double> strategyWeights;
    private String overallConfidence;
    private String summary;

    public MountPreviewVO() {}

    public Long getResourceId() { return resourceId; }
    public void setResourceId(Long v) { this.resourceId = v; }

    public String getResourceType() { return resourceType; }
    public void setResourceType(String v) { this.resourceType = v; }

    public String getResourceTitle() { return resourceTitle; }
    public void setResourceTitle(String v) { this.resourceTitle = v; }

    public List<MountDecision> getCourseMatches() { return courseMatches; }
    public void setCourseMatches(List<MountDecision> v) { this.courseMatches = v; }

    public List<MountDecision> getChapterMatches() { return chapterMatches; }
    public void setChapterMatches(List<MountDecision> v) { this.chapterMatches = v; }

    public List<MountDecision> getKnowledgePointMatches() { return knowledgePointMatches; }
    public void setKnowledgePointMatches(List<MountDecision> v) { this.knowledgePointMatches = v; }

    public Map<String, Double> getStrategyWeights() { return strategyWeights; }
    public void setStrategyWeights(Map<String, Double> v) { this.strategyWeights = v; }

    public String getOverallConfidence() { return overallConfidence; }
    public void setOverallConfidence(String v) { this.overallConfidence = v; }

    public String getSummary() { return summary; }
    public void setSummary(String v) { this.summary = v; }
}
