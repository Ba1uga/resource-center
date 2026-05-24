package com.baluga.backend.modules.mount.review.dto;


public class ReviewStatisticsVO {

    private long totalPending;
    private long totalApproved;
    private long totalModified;
    private long totalRejected;
    private long totalFeedbackReady;
    private double aiAccuracyRate;

    public ReviewStatisticsVO() {}

    public ReviewStatisticsVO(long totalPending, long totalApproved, long totalModified,
                               long totalRejected, long totalFeedbackReady, double aiAccuracyRate) {
        this.totalPending = totalPending;
        this.totalApproved = totalApproved;
        this.totalModified = totalModified;
        this.totalRejected = totalRejected;
        this.totalFeedbackReady = totalFeedbackReady;
        this.aiAccuracyRate = aiAccuracyRate;
    }

    public long getTotalPending() { return totalPending; }
    public void setTotalPending(long v) { this.totalPending = v; }

    public long getTotalApproved() { return totalApproved; }
    public void setTotalApproved(long v) { this.totalApproved = v; }

    public long getTotalModified() { return totalModified; }
    public void setTotalModified(long v) { this.totalModified = v; }

    public long getTotalRejected() { return totalRejected; }
    public void setTotalRejected(long v) { this.totalRejected = v; }

    public long getTotalFeedbackReady() { return totalFeedbackReady; }
    public void setTotalFeedbackReady(long v) { this.totalFeedbackReady = v; }

    public double getAiAccuracyRate() { return aiAccuracyRate; }
    public void setAiAccuracyRate(double v) { this.aiAccuracyRate = v; }
}
