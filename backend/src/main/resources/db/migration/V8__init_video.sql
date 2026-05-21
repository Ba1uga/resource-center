CREATE TABLE video (
    id                   BIGINT AUTO_INCREMENT PRIMARY KEY,
    title                VARCHAR(200) NOT NULL COMMENT '视频标题',
    course               VARCHAR(100) NOT NULL COMMENT '所属课程',
    chapter              VARCHAR(100) NOT NULL COMMENT '所属章节',
    duration             VARCHAR(10) NOT NULL DEFAULT '00:00' COMMENT '时长',
    resolution           VARCHAR(10) NOT NULL DEFAULT '1080p' COMMENT '分辨率',
    view_count           INT NOT NULL DEFAULT 0 COMMENT '播放量',
    uploaded_by          VARCHAR(100) NOT NULL COMMENT '上传人',
    uploaded_at          DATE NOT NULL COMMENT '上传日期',
    file_size            VARCHAR(20) NOT NULL COMMENT '文件大小',
    last_edited_at       DATETIME NOT NULL COMMENT '最近编辑时间',
    cover_label          VARCHAR(50) NOT NULL DEFAULT '' COMMENT '封面标签',
    knowledge_point      VARCHAR(200) NOT NULL DEFAULT '' COMMENT '知识点',
    tags                 JSON NOT NULL COMMENT '标签数组',
    description          VARCHAR(500) NOT NULL DEFAULT '' COMMENT '描述',
    processing_status    VARCHAR(20) NOT NULL DEFAULT 'uploading' COMMENT 'uploading|transcoding|ready|failed',
    publish_status       VARCHAR(20) NOT NULL DEFAULT 'draft' COMMENT 'draft|published|offline',
    resource_alert       VARCHAR(500) NULL COMMENT '资源异常提示',
    visibility           VARCHAR(20) NOT NULL DEFAULT 'students' COMMENT 'internal|students',
    scheduled_publish_at DATETIME NULL COMMENT '定时发布时间',
    created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted              TINYINT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='视频资源表';

INSERT INTO video (id, title, course, chapter, duration, resolution, view_count, uploaded_by, uploaded_at, file_size, last_edited_at, cover_label, knowledge_point, tags, description, processing_status, publish_status, resource_alert, visibility, scheduled_publish_at, created_at, updated_at, deleted)
VALUES
(
    1, '计算机网络概述讲解', '计算机网络', '第1章', '45:30', '1080p', 234, '张老师',
    '2026-03-01', '1.2GB', '2026-03-02 08:30:00', '课程导学', '网络分层模型',
    JSON_ARRAY('导学', '基础'),
    '讲解计算机网络课程的整体结构与学习路径。',
    'ready', 'draft', NULL, 'students', NULL,
    '2026-03-01 09:00:00', '2026-03-02 08:30:00', 0
),
(
    2, '物理层知识点', '计算机网络', '第2章', '38:15', '1080p', 189, '张老师',
    '2026-03-05', '980MB', '2026-03-05 14:20:00', '上传中', '信号与编码',
    JSON_ARRAY('上传', '物理层'),
    '物理层核心概念的录屏视频，当前仍在上传处理中。',
    'uploading', 'draft', '上传中，等待资源处理完成后再发布。', 'students', NULL,
    '2026-03-05 09:00:00', '2026-03-05 14:20:00', 0
),
(
    3, '网络层知识点', '计算机网络', '第3章', '52:00', '720p', 312, '李老师',
    '2026-02-20', '1.5GB', '2026-02-21 10:15:00', '转码中', '网络层转发原理',
    JSON_ARRAY('转码', '网络层'),
    '讲解计算机网络第三章的核心概念，正在转码处理。',
    'transcoding', 'published', '转码中，处理完成后可继续发布。', 'students', NULL,
    '2026-02-20 09:00:00', '2026-02-21 10:15:00', 0
),
(
    4, '算法设计导论', '算法设计', '第2章', '41:18', '1080p', 455, '王老师',
    '2026-04-01', '1.1GB', '2026-04-02 09:00:00', '已发布', '贪心算法',
    JSON_ARRAY('发布', '算法'),
    '已上线的算法设计导论课，面向公开课程。',
    'ready', 'published', NULL, 'students', '2026-04-03 09:00:00',
    '2026-04-01 09:00:00', '2026-04-02 09:00:00', 0
),
(
    5, '操作系统实验课', '操作系统', '第3章', '29:45', '1080p', 98, '王老师',
    '2026-04-10', '860MB', '2026-04-11 16:10:00', '离线', '进程调度',
    JSON_ARRAY('离线', '实验'),
    '已下线的实验课视频，用于归档与复审。',
    'ready', 'offline', '该资源已下架，暂不可对外播放。', 'internal', NULL,
    '2026-04-10 09:00:00', '2026-04-11 16:10:00', 0
),
(
    6, '数据库索引原理', '数据库系统', '第1章', '33:12', '720p', 521, '刘老师',
    '2026-04-15', '1.0GB', '2026-04-15 19:40:00', '失败', 'B+树索引',
    JSON_ARRAY('失败', '索引'),
    '转码失败的视频资源，需要重新处理。',
    'failed', 'draft', '转码失败，请重新提交处理任务。', 'students', NULL,
    '2026-04-15 09:00:00', '2026-04-15 19:40:00', 0
),
(
    7, '软件工程需求分析', '软件工程', '第3章', '48:05', '1080p', 260, '王老师',
    '2026-04-20', '1.3GB', '2026-04-21 11:25:00', '公开', '需求建模',
    JSON_ARRAY('发布', '需求'),
    '已公开发布的软件工程课程视频。',
    'ready', 'published', NULL, 'students', '2026-04-22 10:00:00',
    '2026-04-20 09:00:00', '2026-04-21 11:25:00', 0
),
(
    8, '人工智能导论', '人工智能', '第4章', '56:40', '1080p', 612, '赵老师',
    '2026-04-25', '1.7GB', '2026-04-26 13:00:00', '公开', '搜索与推理',
    JSON_ARRAY('发布', 'AI'),
    '人工智能导论视频，已完成发布并供学生观看。',
    'ready', 'published', NULL, 'students', '2026-04-27 09:00:00',
    '2026-04-25 09:00:00', '2026-04-26 13:00:00', 0
);
