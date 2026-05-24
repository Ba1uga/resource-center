-- V17: 扩展 mapping_candidate 支持多策略匹配详情

ALTER TABLE mapping_candidate
    ADD COLUMN match_strategy VARCHAR(20) NOT NULL DEFAULT 'llm'
        COMMENT '匹配策略: rule|embedding|llm|keyword',
    ADD COLUMN similarity_score DECIMAL(5,4) NULL COMMENT '向量相似度 0.0000~1.0000 (embedding策略使用)',
    ADD COLUMN evidence_snippet VARCHAR(1000) NOT NULL DEFAULT ''
        COMMENT '匹配证据: 资源原文中支撑该匹配的片段',
    ADD COLUMN rank_position INT NOT NULL DEFAULT 0 COMMENT '在当前记录候选列表中的排序位置, 0=最高';
