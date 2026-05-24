-- V15: 扩展 knowledge_point 为层级知识节点
-- 从扁平结构 (course + chapter + name) 扩展为支持: 课程→章→节→知识点→能力点 的层级结构

ALTER TABLE knowledge_point
    ADD COLUMN parent_id BIGINT NULL COMMENT '父节点ID, 构建层级: 课程→章→节→知识点',
    ADD COLUMN node_type VARCHAR(20) NOT NULL DEFAULT 'knowledge_point'
        COMMENT '节点类型: course|chapter|section|knowledge_point|competency|objective',
    ADD COLUMN node_level TINYINT NOT NULL DEFAULT 3 COMMENT '层级深度: 1=课程 2=章 3=节 4=知识点',
    ADD COLUMN sort_order INT NOT NULL DEFAULT 0 COMMENT '同级排序序号',
    ADD COLUMN difficulty VARCHAR(20) NOT NULL DEFAULT '' COMMENT '难度: beginner|intermediate|advanced|expert',
    ADD COLUMN bloom_level TINYINT NULL COMMENT 'Bloom认知层级: 1记忆 2理解 3应用 4分析 5评价 6创造',
    ADD COLUMN keywords VARCHAR(500) NOT NULL DEFAULT '' COMMENT '关键词,逗号分隔',
    ADD COLUMN prerequisites JSON NULL COMMENT '前置知识点ID列表, JSON数组',
    ADD COLUMN embedding_id VARCHAR(64) NULL COMMENT '对应向量存储的ID (pgvector resource_embedding.id)',
    ADD COLUMN extra_meta JSON NULL COMMENT '扩展元数据';

-- 索引
ALTER TABLE knowledge_point
    ADD INDEX idx_parent_id (parent_id),
    ADD INDEX idx_node_type (node_type),
    ADD INDEX idx_embedding_id (embedding_id);
