-- V23: 挂载审核记录表
-- 记录每次人工审核的完整信息, 支撑 Human-in-the-Loop 反馈闭环

CREATE TABLE mount_review_record (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id             BIGINT NULL COMMENT '关联 ai_mount_task.id',
    mapping_record_id   BIGINT NULL COMMENT '关联 mapping_record.id',
    mount_relation_id   BIGINT NULL COMMENT '关联 resource_mount_relation.id (审核确认后创建)',
    review_action       VARCHAR(20) NOT NULL COMMENT '审核动作: approve(确认)|modify(修改)|reject(驳回)|skip(跳过)',
    original_node_id    BIGINT NULL COMMENT 'AI推荐的原始节点ID',
    original_node_name  VARCHAR(200) NOT NULL DEFAULT '' COMMENT 'AI推荐的原始节点名称',
    reviewed_node_id    BIGINT NULL COMMENT '审核后确认的节点ID (modify时与original不同)',
    reviewed_node_name  VARCHAR(200) NOT NULL DEFAULT '' COMMENT '审核后确认的节点名称',
    review_comment      VARCHAR(1000) NOT NULL DEFAULT '' COMMENT '审核意见/备注',
    review_reason       VARCHAR(500) NOT NULL DEFAULT '' COMMENT '修改或驳回的具体原因',
    ai_confidence       DECIMAL(5,4) NULL COMMENT 'AI原始置信度 0.0000~1.0000',
    reviewed_by         VARCHAR(100) NOT NULL COMMENT '审核人用户名',
    reviewed_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '审核时间',
    feedback_used       TINYINT NOT NULL DEFAULT 0 COMMENT '是否已用于反馈训练: 0=未使用 1=已使用',
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted             TINYINT NOT NULL DEFAULT 0,
    INDEX idx_task_id (task_id),
    INDEX idx_reviewer (reviewed_by),
    INDEX idx_feedback_used (feedback_used),
    INDEX idx_review_action (review_action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='挂载审核记录表';
