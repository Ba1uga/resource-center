-- V21: 资源挂载关系表
-- 存储最终确认的资源与知识节点的挂载关系 (confirmed mount)

CREATE TABLE resource_mount_relation (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    resource_type       VARCHAR(20) NOT NULL COMMENT '资源类型: article|courseware|question|video',
    resource_id         BIGINT NOT NULL COMMENT '资源表主键',
    resource_title      VARCHAR(200) NOT NULL COMMENT '资源标题(冗余,便于查询)',
    knowledge_node_id   BIGINT NOT NULL COMMENT '知识图谱节点ID (knowledge_point.id)',
    knowledge_node_type VARCHAR(20) NOT NULL
        COMMENT '节点类型: course|chapter|section|knowledge_point|competency',
    knowledge_node_name VARCHAR(200) NOT NULL COMMENT '节点名称(冗余,便于展示)',
    mount_path          VARCHAR(500) NOT NULL DEFAULT ''
        COMMENT '完整挂载路径: 课程>章>节>知识点',
    mount_source        VARCHAR(20) NOT NULL
        COMMENT '挂载来源: ai_auto(高置信度自动)|ai_recommend(AI推荐人工确认)|manual(人工手动)',
    confidence          DECIMAL(5,4) NULL COMMENT 'AI挂载时的置信度 0.0000~1.0000',
    mapping_record_id   BIGINT NULL COMMENT '关联的映射记录ID (mapping_record.id)',
    status              VARCHAR(20) NOT NULL DEFAULT 'active'
        COMMENT '状态: active(有效)|deprecated(已过期)|removed(已移除)',
    mounted_by          VARCHAR(100) NOT NULL DEFAULT '' COMMENT '挂载操作人: AI模型名 或 用户名',
    mounted_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '挂载时间',
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted             TINYINT NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_unique_mount (resource_type, resource_id, knowledge_node_id),
    INDEX idx_resource (resource_type, resource_id),
    INDEX idx_knowledge_node (knowledge_node_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资源挂载关系表';
