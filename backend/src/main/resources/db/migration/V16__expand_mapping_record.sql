-- V16: 扩展 mapping_record 支持多层级挂载
-- 从仅支持知识点挂载,扩展为支持 course|chapter|section|knowledge_point|competency 多层级挂载

ALTER TABLE mapping_record
    ADD COLUMN mount_target_type VARCHAR(20) NOT NULL DEFAULT 'knowledge_point'
        COMMENT '挂载目标类型: course|chapter|section|knowledge_point|competency',
    ADD COLUMN mount_target_id BIGINT NULL COMMENT '挂载目标节点ID (knowledge_point.id)',
    ADD COLUMN mount_target_name VARCHAR(200) NOT NULL DEFAULT '' COMMENT '挂载目标名称(冗余)',
    ADD COLUMN mount_path VARCHAR(500) NOT NULL DEFAULT ''
        COMMENT '完整挂载路径, 格式: 课程名>章名>节名>知识点名',
    ADD COLUMN auto_mounted TINYINT NOT NULL DEFAULT 0
        COMMENT '是否AI自动挂载: 0=人工确认, 1=AI自动挂载(高置信度)',
    ADD COLUMN mount_confidence DECIMAL(5,4) NULL COMMENT '挂载综合置信度 0.0000~1.0000',
    ADD COLUMN mount_strategy VARCHAR(50) NOT NULL DEFAULT ''
        COMMENT '挂载策略: rule|embedding|llm|keyword|fusion',
    ADD COLUMN feedback_status VARCHAR(20) NOT NULL DEFAULT 'none'
        COMMENT '反馈状态: none|collected|applied';

ALTER TABLE mapping_record
    ADD INDEX idx_mount_target (mount_target_type, mount_target_id),
    ADD INDEX idx_auto_mounted (auto_mounted);
