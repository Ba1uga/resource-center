-- V18: 资源解析内容表
-- 存储文档解析后的完整文本, 支持 PDF/Word/PPT/Markdown 等格式

CREATE TABLE resource_content (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    resource_type   VARCHAR(20) NOT NULL COMMENT '资源类型: article|courseware|question|video',
    resource_id     BIGINT NOT NULL COMMENT '资源表主键 (textbook.id / courseware.id / question.id / video.id)',
    full_text       LONGTEXT NOT NULL COMMENT '解析后的完整文本内容',
    text_format     VARCHAR(20) NOT NULL DEFAULT 'plain' COMMENT '文本格式: plain|markdown|html',
    parse_status    VARCHAR(20) NOT NULL DEFAULT 'pending'
        COMMENT '解析状态: pending|parsing|completed|failed',
    parse_error     VARCHAR(1000) NOT NULL DEFAULT '' COMMENT '解析失败时的错误信息',
    word_count      INT NOT NULL DEFAULT 0 COMMENT '总字数',
    parsed_at       DATETIME NULL COMMENT '解析完成时间',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         TINYINT NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_resource (resource_type, resource_id),
    INDEX idx_parse_status (parse_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资源解析内容表';
