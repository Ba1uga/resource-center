CREATE DATABASE IF NOT EXISTS resource_center
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE resource_center;

CREATE TABLE textbook (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(200)  NOT NULL COMMENT '教材名称',
    author      VARCHAR(100)  NOT NULL COMMENT '作者',
    publisher   VARCHAR(100)  NOT NULL COMMENT '出版社',
    edition     VARCHAR(50)   NOT NULL COMMENT '版本',
    isbn        VARCHAR(20)   NOT NULL COMMENT 'ISBN',
    course      VARCHAR(100)  NOT NULL COMMENT '关联课程',
    owner_id    VARCHAR(50)   NOT NULL DEFAULT '' COMMENT '归属管理员ID',
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted     TINYINT       NOT NULL DEFAULT 0 COMMENT '逻辑删除标志'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教材表';

INSERT INTO textbook (name, author, publisher, edition, isbn, course, owner_id, created_at, updated_at, deleted)
VALUES ('【联调测试】计算机网络（第8版）', '谢希仁', '电子工业出版社', '第8版', '9787121361708', '计算机网络', 'seed-admin-01', '2026-04-02 09:00:00', '2026-04-02 09:00:00', 0),
       ('【联调测试】数据结构（C语言版）', '严蔚敏', '清华大学出版社', '第2版', '9787302147510', '数据结构', 'seed-admin-02', '2026-04-01 09:30:00', '2026-04-01 09:30:00', 0),
       ('【联调测试】操作系统概念', 'Abraham Silberschatz', '高等教育出版社', '第9版', '9787040452532', '操作系统', 'seed-admin-03', '2026-04-03 10:00:00', '2026-04-03 10:00:00', 0),
       ('【联调测试】数据库系统概论', '王珊', '高等教育出版社', '第6版', '9787040556407', '数据库系统', 'seed-admin-04', '2026-04-04 10:30:00', '2026-04-04 10:30:00', 0),
       ('【联调测试】编译原理', '陈意云', '清华大学出版社', '第3版', '9787302501374', '编译原理', 'seed-admin-05', '2026-04-04 11:00:00', '2026-04-04 11:00:00', 0),
       ('【联调测试】离散数学', '屈婉玲', '高等教育出版社', '第2版', '9787040580174', '离散数学', 'seed-admin-06', '2026-04-05 11:30:00', '2026-04-05 11:30:00', 0),
       ('【联调测试】软件工程导论', '张海藩', '清华大学出版社', '第7版', '9787302553915', '软件工程', 'seed-admin-07', '2026-04-06 12:00:00', '2026-04-06 12:00:00', 0),
       ('【联调测试】人工智能导论', '李德毅', '机械工业出版社', '第4版', '9787111726555', '人工智能', 'seed-admin-08', '2026-04-07 12:30:00', '2026-04-07 12:30:00', 0),
       ('【联调测试】计算机组成原理', '唐朔飞', '高等教育出版社', '第3版', '9787040521979', '计算机组成原理', 'seed-admin-09', '2026-04-08 13:00:00', '2026-04-08 13:00:00', 0),
       ('【联调测试】程序设计基础（Python）', '嵩天', '高等教育出版社', '第2版', '9787040566208', '程序设计基础', 'seed-admin-10', '2026-04-09 13:30:00', '2026-04-09 13:30:00', 0),
       ('【联调测试】机器学习', '周志华', '清华大学出版社', '第1版', '9787302423287', '机器学习', 'seed-admin-11', '2026-03-20 14:00:00', '2026-03-20 14:00:00', 0),
       ('【联调测试】计算机图形学', 'Peter Shirley', '人民邮电出版社', '第5版', '9787115599940', '计算机图形学', 'seed-admin-12', '2026-03-22 14:30:00', '2026-03-22 14:30:00', 0);
