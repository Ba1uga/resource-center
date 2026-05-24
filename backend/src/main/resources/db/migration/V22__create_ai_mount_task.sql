-- V22: AI挂载任务表
-- 追踪每个AI挂载任务的完整生命周期和执行进度

CREATE TABLE ai_mount_task (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_type           VARCHAR(30) NOT NULL COMMENT '任务类型: single_mount|batch_mount|remount|refresh',
    resource_type       VARCHAR(20) NULL COMMENT '单个任务时的资源类型 (批量任务为NULL)',
    resource_id         BIGINT NULL COMMENT '单个任务时的资源ID (批量任务为NULL)',
    batch_id            BIGINT NULL COMMENT '关联的 mapping_batch.id (批量任务)',
    status              VARCHAR(20) NOT NULL DEFAULT 'queued'
        COMMENT '任务状态: queued|parsing|embedding|matching|reviewing|completed|failed|cancelled',
    priority            TINYINT NOT NULL DEFAULT 5 COMMENT '优先级: 1(最高)~10(最低)',
    progress            DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '进度百分比 0.00~100.00',
    current_phase       VARCHAR(30) NOT NULL DEFAULT '' COMMENT '当前阶段: parsing|chunking|embedding|matching|deciding',
    phase_detail        VARCHAR(200) NOT NULL DEFAULT '' COMMENT '当前阶段的详细描述',
    total_items         INT NOT NULL DEFAULT 0 COMMENT '总处理项数',
    completed_items     INT NOT NULL DEFAULT 0 COMMENT '已完成项数',
    failed_items        INT NOT NULL DEFAULT 0 COMMENT '失败项数',
    error_message       TEXT NULL COMMENT '任务失败时的错误信息',
    config_snapshot     JSON NULL COMMENT '执行时的配置快照 (provider/model/strategy等)',
    started_at          DATETIME NULL COMMENT '任务开始执行时间',
    completed_at        DATETIME NULL COMMENT '任务完成时间',
    created_by          VARCHAR(100) NOT NULL DEFAULT '' COMMENT '任务创建人',
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted             TINYINT NOT NULL DEFAULT 0,
    INDEX idx_status (status),
    INDEX idx_resource (resource_type, resource_id),
    INDEX idx_batch_id (batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI挂载任务表';
