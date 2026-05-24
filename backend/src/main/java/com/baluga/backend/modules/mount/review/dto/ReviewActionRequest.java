package com.baluga.backend.modules.mount.review.dto;


public class ReviewActionRequest {

    private Long reviewedNodeId;
    private String reviewedNodeName;
    private String reviewComment;
    private String reviewReason;

    public Long getReviewedNodeId() { return reviewedNodeId; }
    public void setReviewedNodeId(Long v) { this.reviewedNodeId = v; }

    public String getReviewedNodeName() { return reviewedNodeName; }
    public void setReviewedNodeName(String v) { this.reviewedNodeName = v; }

    public String getReviewComment() { return reviewComment; }
    public void setReviewComment(String v) { this.reviewComment = v; }

    public String getReviewReason() { return reviewReason; }
    public void setReviewReason(String v) { this.reviewReason = v; }
}
