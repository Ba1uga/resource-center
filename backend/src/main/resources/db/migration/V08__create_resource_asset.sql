-- V8: 统一资源资产表，支持课件/教材/视频模块的真实文件上传
CREATE TABLE IF NOT EXISTS resource_asset (
    id            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    module_type   VARCHAR(32)  NOT NULL COMMENT '模块类型: textbook|courseware|video',
    module_id     BIGINT       NULL     COMMENT '关联业务记录ID，业务创建后可回填',
    bucket        VARCHAR(64)  NOT NULL DEFAULT 'local' COMMENT '存储桶标识',
    object_key    VARCHAR(512) NOT NULL COMMENT '对象存储路径/Key',
    origin_name   VARCHAR(512) NOT NULL COMMENT '原始文件名',
    mime_type     VARCHAR(128) NOT NULL COMMENT 'MIME类型',
    size_bytes    BIGINT       NOT NULL DEFAULT 0 COMMENT '文件字节数',
    sha256        VARCHAR(64)  NULL     COMMENT '文件SHA-256哈希',
    upload_status VARCHAR(32)  NOT NULL DEFAULT 'init' COMMENT '上传状态: init|uploading|success|failed',
    upload_token  VARCHAR(64)  NOT NULL COMMENT '上传令牌(UUID)',
    created_by    VARCHAR(128) NULL     COMMENT '创建人',
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted       TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除: 0=正常, 1=已删除',
    PRIMARY KEY (id),
    INDEX idx_upload_token (upload_token),
    INDEX idx_module (module_type, module_id),
    INDEX idx_upload_status (upload_status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='统一资源资产表';
