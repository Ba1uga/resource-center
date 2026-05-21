CREATE TABLE knowledge_point (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    name             VARCHAR(200) NOT NULL COMMENT '知识点名称',
    course           VARCHAR(100) NOT NULL COMMENT '所属课程',
    chapter          VARCHAR(100) NOT NULL COMMENT '所属章节',
    description      VARCHAR(500) NOT NULL DEFAULT '' COMMENT '知识点描述',
    source_type      VARCHAR(20)  NOT NULL DEFAULT 'outline' COMMENT 'outline|manual|ai_extracted',
    source_id        BIGINT NULL COMMENT '来源记录ID',
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted          TINYINT      NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_course_chapter_name (course, chapter, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识点库';

CREATE TABLE mapping_batch (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    label            VARCHAR(100) NOT NULL COMMENT '批次标签',
    status           VARCHAR(20)  NOT NULL DEFAULT 'pending' COMMENT 'pending|processing|completed|failed',
    course_filter    VARCHAR(100) NOT NULL DEFAULT '' COMMENT '课程范围过滤',
    total_resources  INT          NOT NULL DEFAULT 0 COMMENT '资源总数',
    matched_count    INT          NOT NULL DEFAULT 0 COMMENT '匹配成功数',
    failed_count     INT          NOT NULL DEFAULT 0 COMMENT '匹配失败数',
    created_by       VARCHAR(100) NOT NULL DEFAULT '' COMMENT '创建人',
    started_at       DATETIME     NULL COMMENT '开始处理时间',
    completed_at     DATETIME     NULL COMMENT '完成时间',
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted          TINYINT      NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI挂载批次表';

CREATE TABLE mapping_record (
    id                           BIGINT AUTO_INCREMENT PRIMARY KEY,
    batch_id                     BIGINT NOT NULL COMMENT '批次ID',
    resource_type                VARCHAR(20)  NOT NULL COMMENT 'article|courseware|question|video|excerpt',
    resource_id                  BIGINT NOT NULL COMMENT '原始资源表主键',
    resource_title               VARCHAR(200) NOT NULL COMMENT '资源标题',
    course_name                  VARCHAR(100) NOT NULL COMMENT '课程名称',
    chapter_name                 VARCHAR(100) NOT NULL COMMENT '章节名称',
    review_status                VARCHAR(20)  NOT NULL DEFAULT 'pending' COMMENT 'pending|approved|rejected',
    confidence_level             VARCHAR(10)  NOT NULL DEFAULT 'low' COMMENT 'high|medium|low',
    primary_knowledge_point_id   BIGINT NULL COMMENT '确认的主知识点ID',
    selected_candidate_id        BIGINT NULL COMMENT '选中的候选ID',
    created_at                   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted                      TINYINT      NOT NULL DEFAULT 0,
    INDEX idx_batch_id (batch_id),
    INDEX idx_review_status (review_status),
    INDEX idx_confidence_level (confidence_level),
    INDEX idx_course (course_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='映射记录表';

CREATE TABLE mapping_candidate (
    id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
    mapping_record_id     BIGINT NOT NULL COMMENT '映射记录ID',
    knowledge_point_id    BIGINT NOT NULL COMMENT '知识点ID',
    knowledge_point_name  VARCHAR(200) NOT NULL COMMENT '知识点名称',
    confidence_level      VARCHAR(10)  NOT NULL DEFAULT 'low' COMMENT 'high|medium|low',
    matched_by            VARCHAR(10)  NOT NULL DEFAULT 'ai' COMMENT 'ai|manual',
    note                  VARCHAR(500) NOT NULL DEFAULT '' COMMENT '匹配理由',
    created_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted               TINYINT      NOT NULL DEFAULT 0,
    INDEX idx_mapping_record_id (mapping_record_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='映射候选表';

-- 从 outline_version 中的 knowledgeGoals 提取知识点
INSERT INTO knowledge_point (name, course, chapter, description, source_type, source_id)
SELECT DISTINCT
    goal_text.name,
    oc.title,
    COALESCE(sch_item.chapter, ''),
    goal_text.name,
    'outline',
    ov.id
FROM outline_version ov
JOIN outline_course oc ON ov.course_id = oc.id
CROSS JOIN JSON_TABLE(
    JSON_EXTRACT(ov.sections, '$.knowledgeGoals[*].text'),
    '$[*]' COLUMNS (name VARCHAR(200) PATH '$')
) AS goal_text
LEFT JOIN JSON_TABLE(
    JSON_EXTRACT(ov.sections, '$.schedule[*].chapterLabel'),
    '$[*]' COLUMNS (chapter VARCHAR(100) PATH '$')
) AS sch_item ON 1 = 1
WHERE ov.sections IS NOT NULL
  AND JSON_EXTRACT(ov.sections, '$.knowledgeGoals') IS NOT NULL
  AND goal_text.name IS NOT NULL
  AND goal_text.name != ''
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- 从 outline_version 中的 schedule topics 提取知识点
INSERT INTO knowledge_point (name, course, chapter, description, source_type, source_id)
SELECT DISTINCT
    sch_topic.topic,
    oc.title,
    COALESCE(sch_topic.chapter, ''),
    sch_topic.topic,
    'outline',
    ov.id
FROM outline_version ov
JOIN outline_course oc ON ov.course_id = oc.id
CROSS JOIN JSON_TABLE(
    JSON_EXTRACT(ov.sections, '$.schedule[*]'),
    '$[*]' COLUMNS (
        topic VARCHAR(200) PATH '$.topic',
        chapter VARCHAR(100) PATH '$.chapterLabel'
    )
) AS sch_topic
WHERE ov.sections IS NOT NULL
  AND sch_topic.topic IS NOT NULL
  AND sch_topic.topic != ''
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- 从 question 表提取知识点
INSERT INTO knowledge_point (name, course, chapter, description, source_type, source_id)
SELECT DISTINCT
    q.knowledge_point,
    q.subject_id,
    q.chapter_id,
    q.knowledge_point,
    'ai_extracted',
    q.id
FROM question q
WHERE q.knowledge_point IS NOT NULL
  AND q.knowledge_point != ''
  AND q.deleted = 0
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- 从 video 表提取知识点
INSERT INTO knowledge_point (name, course, chapter, description, source_type, source_id)
SELECT DISTINCT
    v.knowledge_point,
    v.course,
    v.chapter,
    v.knowledge_point,
    'ai_extracted',
    v.id
FROM video v
WHERE v.knowledge_point IS NOT NULL
  AND v.knowledge_point != ''
  AND v.deleted = 0
ON DUPLICATE KEY UPDATE updated_at = NOW();
