package com.baluga.backend.modules.mount.dto;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;


public class MountDecision {

    private Long nodeId;
    private String nodeName;
    private String nodeType;
    private Integer nodeLevel;
    private String mountPath;
    private double fusionScore;
    private String topStrategy;
    private String confidence;
    private String evidence;
    private List<String> contributingStrategies;

    public MountDecision() {}

    public Long getNodeId() { return nodeId; }
    public void setNodeId(Long v) { this.nodeId = v; }

    public String getNodeName() { return nodeName; }
    public void setNodeName(String v) { this.nodeName = v; }

    public String getNodeType() { return nodeType; }
    public void setNodeType(String v) { this.nodeType = v; }

    public Integer getNodeLevel() { return nodeLevel; }
    public void setNodeLevel(Integer v) { this.nodeLevel = v; }

    public String getMountPath() { return mountPath; }
    public void setMountPath(String v) { this.mountPath = v; }

    public double getFusionScore() { return fusionScore; }
    public void setFusionScore(double v) { this.fusionScore = v; }

    public String getTopStrategy() { return topStrategy; }
    public void setTopStrategy(String v) { this.topStrategy = v; }

    public String getConfidence() { return confidence; }
    public void setConfidence(String v) { this.confidence = v; }

    public String getEvidence() { return evidence; }
    public void setEvidence(String v) { this.evidence = v; }

    public List<String> getContributingStrategies() { return contributingStrategies; }
    public void setContributingStrategies(List<String> v) { this.contributingStrategies = v; }

    /** 0~1 confidence mapped to high/medium/low */
    public String confidenceLabel() {
        if (fusionScore >= 0.85) return "high";
        if (fusionScore >= 0.6) return "medium";
        return "low";
    }

    /** Whether this decision qualifies for auto-mount (no human review) */
    public boolean isAutoApprovable() {
        return fusionScore >= 0.85;
    }

    /** Whether this decision needs human review */
    public boolean needsReview() {
        return fusionScore >= 0.4 && fusionScore < 0.85;
    }

    public BigDecimal getConfidenceDecimal() {
        return BigDecimal.valueOf(fusionScore).setScale(4, RoundingMode.HALF_UP);
    }
}
