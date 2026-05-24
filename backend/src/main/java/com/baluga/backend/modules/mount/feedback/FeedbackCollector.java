package com.baluga.backend.modules.mount.feedback;

import com.baluga.backend.modules.mapping.entity.MountReviewRecord;
import com.baluga.backend.modules.mapping.mapper.MountReviewRecordMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;


@Component
public class FeedbackCollector {

    private static final Logger log = LoggerFactory.getLogger(FeedbackCollector.class);

    private final MountReviewRecordMapper reviewRecordMapper;

    public FeedbackCollector(MountReviewRecordMapper reviewRecordMapper) {
        this.reviewRecordMapper = reviewRecordMapper;
    }

    /**
     * Export approved + modified reviews as JSONL feedback data.
     * Format: {originalNodeId, originalNodeName, reviewedNodeId,
     *           reviewedNodeName, action, reason, aiConfidence}
     *
     * Approve records = AI was correct (positive sample)
     * Modify records = AI was close but wrong (corrected sample)
     * Reject records = AI was wrong (negative sample)
     */
    public String exportFeedbackJsonl() {
        var all = reviewRecordMapper.selectList(null);

        List<MountReviewRecord> reviewed = all.stream()
                .filter(r -> !"pending".equals(r.getReviewAction())
                        && r.getFeedbackUsed() == 0)
                .collect(Collectors.toList());

        StringBuilder sb = new StringBuilder();
        for (MountReviewRecord r : reviewed) {
            sb.append(String.format(
                    "{\"reviewId\":%d,\"originalNodeId\":%d,\"originalNodeName\":\"%s\","
                            + "\"reviewedNodeId\":%d,\"reviewedNodeName\":\"%s\","
                            + "\"action\":\"%s\",\"reason\":\"%s\",\"aiConfidence\":%s}\n",
                    r.getId(),
                    r.getOriginalNodeId() != null ? r.getOriginalNodeId() : 0,
                    escape(r.getOriginalNodeName()),
                    r.getReviewedNodeId() != null ? r.getReviewedNodeId() : 0,
                    escape(r.getReviewedNodeName()),
                    r.getReviewAction(),
                    escape(r.getReviewReason()),
                    r.getAiConfidence() != null ? r.getAiConfidence().toString() : "null"
            ));
        }

        log.info("导出反馈数据: {} 条 (共 {} 条总审核记录)", reviewed.size(), all.size());
        return sb.toString();
    }

    /**
     * Mark exported records as feedback_used=1
     */
    public int markAsUsed() {
        var all = reviewRecordMapper.selectList(null);
        int count = 0;
        for (MountReviewRecord r : all) {
            if (r.getFeedbackUsed() == 0 && !"pending".equals(r.getReviewAction())) {
                r.setFeedbackUsed(1);
                reviewRecordMapper.updateById(r);
                count++;
            }
        }
        log.info("标记反馈已使用: {} 条", count);
        return count;
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"")
                .replace("\n", "\\n").replace("\r", "");
    }
}
