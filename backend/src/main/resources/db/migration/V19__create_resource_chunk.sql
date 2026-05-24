-- V19: 资源分块表
-- 存储资源解析后的语义分块, 每块 200~1500 tokens, 支持向量检索

CREATE TABLE resource_chunk (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    resource_type   VARCHAR(20) NOT NULL COMMENT '资源类型: article|courseware|question|video',
    resource_id     BIGINT NOT NULL COMMENT '资源表主键',
    content_id      BIGINT NOT NULL COMMENT '关联 resource_content.id',
    chunk_index     INT NOT NULL COMMENT '分块序号(从0开始)',
    chunk_text      TEXT NOT NULL COMMENT '分块文本内容',
    token_count     INT NOT NULL DEFAULT 0 COMMENT '预估token数',
    content_type    VARCHAR(20) NOT NULL DEFAULT 'general'
        COMMENT '内容类型: definition|example|exercise|explanation|summary|general',
    page_number     INT NULL COMMENT '页码(教材/PDF)',
    slide_number    INT NULL COMMENT '幻灯片号(PPT)',
    timestamp_start INT NULL COMMENT '视频起始秒',
    timestamp_end   INT NULL COMMENT '视频结束秒',
    section_title   VARCHAR(200) NOT NULL DEFAULT '' COMMENT '所在章节标题',
    embedding_id    VARCHAR(64) NULL COMMENT '关联 resource_embedding.id (向量数据库)',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         TINYINT NOT NULL DEFAULT 0,
    INDEX idx_resource (resource_type, resource_id),
    INDEX idx_content_id (content_id),
    INDEX idx_embedding_id (embedding_id),
    INDEX idx_chunk_index (content_id, chunk_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资源分块表';
