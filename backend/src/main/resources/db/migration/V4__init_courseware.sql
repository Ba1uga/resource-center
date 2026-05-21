CREATE TABLE courseware (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(200) NOT NULL COMMENT '课件标题',
    course      VARCHAR(100) NOT NULL COMMENT '课程',
    chapter     VARCHAR(100) NOT NULL COMMENT '章节',
    type        VARCHAR(10)  NOT NULL COMMENT '课件类型 PPT|PDF|DOC',
    file_size   VARCHAR(20)  NOT NULL COMMENT '文件大小',
    uploaded_by VARCHAR(100) NOT NULL COMMENT '上传人',
    uploaded_at DATE         NOT NULL COMMENT '上传日期',
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted     TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除标志'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='课件表';

INSERT INTO courseware (id, title, course, chapter, type, file_size, uploaded_by, uploaded_at, created_at, updated_at, deleted)
VALUES
    (1,  '第一章 计算机网络概述', '计算机网络',      '第1章', 'PPT', '2.5 MB', '林老师', '2026-04-12', '2026-04-12 09:00:00', '2026-04-12 09:00:00', 0),
    (2,  '第二章 物理层',         '计算机网络',      '第2章', 'PPT', '3.1 MB', '林老师', '2026-04-10', '2026-04-10 09:00:00', '2026-04-10 09:00:00', 0),
    (3,  '第三章 数据链路层',     '计算机网络',      '第3章', 'PDF', '1.9 MB', '林老师', '2026-04-08', '2026-04-08 09:00:00', '2026-04-08 09:00:00', 0),
    (4,  '第四章 网络层',         '计算机网络',      '第4章', 'PPT', '2.2 MB', '林老师', '2026-04-06', '2026-04-06 09:00:00', '2026-04-06 09:00:00', 0),
    (5,  '数据结构导论',          '数据结构',        '第1章', 'PDF', '1.8 MB', '林老师', '2026-04-04', '2026-04-04 09:00:00', '2026-04-04 09:00:00', 0),
    (6,  '线性表实现',            '数据结构',        '第2章', 'PPT', '2.1 MB', '林老师', '2026-04-03', '2026-04-03 09:00:00', '2026-04-03 09:00:00', 0),
    (7,  '操作系统调度',          '操作系统',        '第4章', 'PPT', '3.4 MB', '林老师', '2026-04-02', '2026-04-02 09:00:00', '2026-04-02 09:00:00', 0),
    (8,  '数据库索引设计',        '数据库系统',      '第5章', 'PDF', '2.6 MB', '林老师', '2026-03-30', '2026-03-30 09:00:00', '2026-03-30 09:00:00', 0),
    (9,  'Python 函数式编程',     'Python程序设计',  '第6章', 'PPT', '4.0 MB', '林老师', '2026-03-28', '2026-03-28 09:00:00', '2026-03-28 09:00:00', 0),
    (10, '软件测试基础',          '软件工程',        '第3章', 'DOC', '1.3 MB', '林老师', '2026-03-20', '2026-03-20 09:00:00', '2026-03-20 09:00:00', 0);