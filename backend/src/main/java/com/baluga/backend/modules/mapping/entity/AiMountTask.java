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
@TableName("ai_mount_task")
public class AiMountTask {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("task_type")
    private String taskType;

    @TableField("resource_type")
    private String resourceType;

    @TableField("resource_id")
    private Long resourceId;

    @TableField("batch_id")
    private Long batchId;

    @TableField("status")
    private String status;

    @TableField("priority")
    private Integer priority;

    @TableField("progress")
    private BigDecimal progress;

    @TableField("current_phase")
    private String currentPhase;

    @TableField("phase_detail")
    private String phaseDetail;

    @TableField("total_items")
    private Integer totalItems;

    @TableField("completed_items")
    private Integer completedItems;

    @TableField("failed_items")
    private Integer failedItems;

    @TableField("error_message")
    private String errorMessage;

    @TableField("config_snapshot")
    private String configSnapshot;

    @TableField("started_at")
    private LocalDateTime startedAt;

    @TableField("completed_at")
    private LocalDateTime completedAt;

    @TableField("created_by")
    private String createdBy;

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer deleted;
}
