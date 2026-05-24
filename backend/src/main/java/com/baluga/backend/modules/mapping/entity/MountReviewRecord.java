package com.baluga.backend.modules.mapping.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("mount_review_record")
public class MountReviewRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("task_id")
    private Long taskId;

    @TableField("mapping_record_id")
    private Long mappingRecordId;

    @TableField("mount_relation_id")
    private Long mountRelationId;

    @TableField("review_action")
    private String reviewAction;

    @TableField("original_node_id")
    private Long originalNodeId;

    @TableField("original_node_name")
    private String originalNodeName;

    @TableField("reviewed_node_id")
    private Long reviewedNodeId;

    @TableField("reviewed_node_name")
    private String reviewedNodeName;

    @TableField("review_comment")
    private String reviewComment;

    @TableField("review_reason")
    private String reviewReason;

    @TableField("ai_confidence")
    private BigDecimal aiConfidence;

    @TableField("reviewed_by")
    private String reviewedBy;

    @TableField("reviewed_at")
    private LocalDateTime reviewedAt;

    @TableField("feedback_used")
    private Integer feedbackUsed;

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer deleted;
}
