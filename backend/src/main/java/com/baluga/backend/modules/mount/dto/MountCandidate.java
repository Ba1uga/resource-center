package com.baluga.backend.modules.mount.dto;

public class MountCandidate {

    private Long nodeId;
    private String nodeName;
    private String nodeType;
    private Integer nodeLevel;
    private String mountPath;
    private String strategyName;
    private double strategyScore;
    private String confidence;
    private String evidence;
    private String matchType;

    public MountCandidate() {}

    public MountCandidate(Long nodeId, String nodeName, String nodeType, Integer nodeLevel,
                          String strategyName, double strategyScore, String confidence) {
        this.nodeId = nodeId;
        this.nodeName = nodeName;
        this.nodeType = nodeType;
        this.nodeLevel = nodeLevel;
        this.strategyName = strategyName;
        this.strategyScore = strategyScore;
        this.confidence = confidence;
    }

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

    public String getStrategyName() { return strategyName; }
    public void setStrategyName(String v) { this.strategyName = v; }

    public double getStrategyScore() { return strategyScore; }
    public void setStrategyScore(double v) { this.strategyScore = v; }

    public String getConfidence() { return confidence; }
    public void setConfidence(String v) { this.confidence = v; }

    public String getEvidence() { return evidence; }
    public void setEvidence(String v) { this.evidence = v; }

    public String getMatchType() { return matchType; }
    public void setMatchType(String v) { this.matchType = v; }

    public MountDecision toDecision(double fusionScore) {
        MountDecision d = new MountDecision();
        d.setNodeId(nodeId);
        d.setNodeName(nodeName);
        d.setNodeType(nodeType);
        d.setNodeLevel(nodeLevel);
        d.setMountPath(mountPath);
        d.setFusionScore(fusionScore);
        d.setTopStrategy(strategyName);
        d.setConfidence(confidence);
        d.setEvidence(evidence);
        return d;
    }
}
