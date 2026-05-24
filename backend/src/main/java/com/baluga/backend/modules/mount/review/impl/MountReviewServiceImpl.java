package com.baluga.backend.modules.mount.review.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baluga.backend.modules.mapping.entity.MountReviewRecord;
import com.baluga.backend.modules.mapping.entity.ResourceMountRelation;
import com.baluga.backend.modules.mapping.mapper.MountReviewRecordMapper;
import com.baluga.backend.modules.mapping.mapper.ResourceMountRelationMapper;
import com.baluga.backend.modules.mount.review.MountReviewService;
import com.baluga.backend.modules.mount.review.dto.ReviewActionRequest;
import com.baluga.backend.modules.mount.review.dto.ReviewStatisticsVO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;


@Service
public class MountReviewServiceImpl implements MountReviewService {

    private static final Logger log = LoggerFactory.getLogger(MountReviewServiceImpl.class);

    private final MountReviewRecordMapper reviewRecordMapper;
    private final ResourceMountRelationMapper mountRelationMapper;

    public MountReviewServiceImpl(MountReviewRecordMapper reviewRecordMapper,
                                   ResourceMountRelationMapper mountRelationMapper) {
        this.reviewRecordMapper = reviewRecordMapper;
        this.mountRelationMapper = mountRelationMapper;
    }

    @Override
    public Page<MountReviewRecord> pageReviews(String action, Integer page, Integer pageSize) {
        LambdaQueryWrapper<MountReviewRecord> wrapper = Wrappers.lambdaQuery();
        if (action != null && !action.isEmpty()) {
            wrapper.eq(MountReviewRecord::getReviewAction, action);
        }
        // Show pending + already-reviewed, most recent first
        wrapper.orderByDesc(MountReviewRecord::getCreatedAt);
        return reviewRecordMapper.selectPage(new Page<>(
                page != null ? page : 1,
                pageSize != null ? pageSize : 10), wrapper);
    }

    @Override
    public MountReviewRecord getReview(Long reviewId) {
        return reviewRecordMapper.selectById(reviewId);
    }

    @Override
    @Transactional
    public MountReviewRecord approve(Long reviewId, ReviewActionRequest request) {
        MountReviewRecord record = reviewRecordMapper.selectById(reviewId);
        if (record == null) throw new IllegalArgumentException("审核记录不存在");

        applyReview(record, "approve", record.getOriginalNodeId(),
                record.getOriginalNodeName(), request);
        return record;
    }

    @Override
    @Transactional
    public MountReviewRecord modify(Long reviewId, ReviewActionRequest request) {
        MountReviewRecord record = reviewRecordMapper.selectById(reviewId);
        if (record == null) throw new IllegalArgumentException("审核记录不存在");

        if (request.getReviewedNodeId() == null) {
            throw new IllegalArgumentException("修改挂载时必须提供 reviewedNodeId");
        }

        applyReview(record, "modify", request.getReviewedNodeId(),
                request.getReviewedNodeName() != null ? request.getReviewedNodeName() : "",
                request);

        // Update the mount relation to point to the corrected node
        updateMountRelationTarget(record, request);

        return record;
    }

    @Override
    @Transactional
    public MountReviewRecord reject(Long reviewId, ReviewActionRequest request) {
        MountReviewRecord record = reviewRecordMapper.selectById(reviewId);
        if (record == null) throw new IllegalArgumentException("审核记录不存在");

        applyReview(record, "reject", null, "", request);

        // Remove rejected mount relation
        if (record.getMountRelationId() != null) {
            ResourceMountRelation rel = mountRelationMapper.selectById(record.getMountRelationId());
            if (rel != null) {
                rel.setStatus("removed");
                mountRelationMapper.updateById(rel);
            }
        }

        return record;
    }

    @Override
    public ReviewStatisticsVO getStatistics() {
        var all = reviewRecordMapper.selectList(Wrappers.lambdaQuery());
        long pending = all.stream().filter(r -> "pending".equals(r.getReviewAction())).count();
        long approved = all.stream().filter(r -> "approve".equals(r.getReviewAction())).count();
        long modified = all.stream().filter(r -> "modify".equals(r.getReviewAction())).count();
        long rejected = all.stream().filter(r -> "reject".equals(r.getReviewAction())).count();
        long feedbackReady = all.stream().filter(r -> r.getFeedbackUsed() == 0
                && !"pending".equals(r.getReviewAction())).count();

        double accuracy = 0.0;
        long reviewed = approved + modified + rejected;
        if (reviewed > 0) {
            // approved = AI was right; modified/rejected = AI was wrong
            accuracy = (double) approved / reviewed;
        }

        return new ReviewStatisticsVO(pending, approved, modified,
                rejected, feedbackReady, accuracy);
    }

    private void applyReview(MountReviewRecord record, String action,
                              Long nodeId, String nodeName, ReviewActionRequest request) {
        record.setReviewAction(action);
        record.setReviewedNodeId(nodeId);
        record.setReviewedNodeName(nodeName);
        record.setReviewComment(request.getReviewComment() != null ? request.getReviewComment() : "");
        record.setReviewReason(request.getReviewReason() != null ? request.getReviewReason() : "");
        record.setReviewedBy("admin");
        record.setReviewedAt(LocalDateTime.now());
        reviewRecordMapper.updateById(record);

        log.info("审核完成: recordId={}, action={}, node={}", record.getId(), action, nodeName);
    }

    private void updateMountRelationTarget(MountReviewRecord record, ReviewActionRequest request) {
        if (record.getMountRelationId() == null && record.getTaskId() != null) {
            // Find mount relation by task
            LambdaQueryWrapper<ResourceMountRelation> wrapper = Wrappers.lambdaQuery();
            wrapper.eq(ResourceMountRelation::getMountedBy,
                    "AI+" + (record.getAiConfidence() != null ? "fusion" : "llm"));
            // Fallback: update all relations created by AI for this task is fragile,
            // so we rely on mountRelationId being set
        }

        if (record.getMountRelationId() != null) {
            ResourceMountRelation rel = mountRelationMapper.selectById(record.getMountRelationId());
            if (rel != null) {
                rel.setKnowledgeNodeId(request.getReviewedNodeId());
                rel.setKnowledgeNodeName(request.getReviewedNodeName());
                rel.setMountSource("manual");
                rel.setMountedBy("admin");
                mountRelationMapper.updateById(rel);
            }
        }
    }
}
