CREATE TABLE outline_course (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(200) NOT NULL COMMENT '课程名称',
    instructor  VARCHAR(100) NOT NULL COMMENT '授课教师',
    department  VARCHAR(100) NOT NULL COMMENT '所属教研室',
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted     TINYINT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='大纲课程表';

CREATE TABLE outline_version (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id       BIGINT NOT NULL COMMENT '关联课程ID',
    version_name    VARCHAR(100) NOT NULL COMMENT '版本名称',
    semester        VARCHAR(50) NOT NULL COMMENT '学期',
    status          VARCHAR(10) NOT NULL DEFAULT 'draft' COMMENT 'draft | final',
    archive_state   VARCHAR(10) NOT NULL DEFAULT 'active' COMMENT 'active | archived',
    archived_at     DATETIME NULL COMMENT '归档时间',
    note            VARCHAR(500) NOT NULL DEFAULT '' COMMENT '备注',
    created_by      VARCHAR(100) NOT NULL COMMENT '创建人',
    updated_by      VARCHAR(100) NOT NULL COMMENT '最近修改人',
    sections        JSON NOT NULL COMMENT '大纲内容JSON',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         TINYINT NOT NULL DEFAULT 0,
    INDEX idx_course_id (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='大纲版本表';

INSERT INTO outline_course (id, title, instructor, department, created_at, updated_at, deleted)
VALUES (1, '【测试数据】函数与导数', '林知夏', '数学教研组', '2026-03-01 09:00:00', '2026-04-10 09:30:00', 0),
       (2, '【测试数据】立体几何', '林知夏', '数学教研组', '2026-03-02 09:00:00', '2026-03-25 08:20:00', 0),
       (3, '【测试数据】概率与统计', '周晨', '统计教研组', '2026-03-03 09:00:00', '2026-03-12 15:20:00', 0);

INSERT INTO outline_version (
    id, course_id, version_name, semester, status, archive_state, archived_at, note, created_by, updated_by, sections, created_at, updated_at, deleted
)
VALUES
    (
        1, 1, '2026 春版', '2026春', 'draft', 'active', NULL,
        '【测试数据】面向新学期的一轮复习方案。', '林知夏', '林知夏',
        JSON_OBJECT(
            'basicInfo', JSON_OBJECT('courseName', '函数与导数', 'credits', 4, 'hours', 64, 'instructor', '林知夏', 'majors', JSON_ARRAY('数学教育', '应用数学')),
            'knowledgeGoals', JSON_ARRAY(JSON_OBJECT('id', 'fd-k-1', 'text', '理解函数、极限与导数的基本概念。')),
            'abilityGoals', JSON_ARRAY(JSON_OBJECT('id', 'fd-a-1', 'text', '能够运用导数分析变化趋势并解决综合题。')),
            'schedule', JSON_ARRAY(
                JSON_OBJECT('id', 'fd-s-1', 'weekLabel', '第1周', 'topic', '函数与定义域', 'hours', 4, 'teachingMethod', '讲授+讨论', 'notes', '结合典型错题导入。', 'chapterLabel', '第一章'),
                JSON_OBJECT('id', 'fd-s-2', 'weekLabel', '第2周', 'topic', '极限与连续', 'hours', 4, 'teachingMethod', '讲授+案例分析', 'notes', '加入图像判断训练。', 'chapterLabel', '第一章'),
                JSON_OBJECT('id', 'fd-s-3', 'weekLabel', '第3周', 'topic', '导数概念与几何意义', 'hours', 4, 'teachingMethod', '讲授', 'notes', '强化切线问题。', 'chapterLabel', '第二章'),
                JSON_OBJECT('id', 'fd-s-4', 'weekLabel', '第4周', 'topic', '导数应用', 'hours', 4, 'teachingMethod', '讲授+作业反馈', 'notes', '组织小测并讲评。', 'chapterLabel', '第二章')
            ),
            'teachingMethods', JSON_OBJECT('selected', JSON_ARRAY(), 'notes', ''),
            'assessment', JSON_OBJECT(
                'usualPercentage', 30, 'midtermPercentage', 20, 'finalPercentage', 50,
                'usualItems', JSON_ARRAY(
                    JSON_OBJECT('id', 'fd-u-1', 'label', '作业', 'percentage', 20),
                    JSON_OBJECT('id', 'fd-u-2', 'label', '课堂表现', 'percentage', 10)
                ),
                'notes', '采用阶段测评与期末综合考核。'
            ),
            'materials', JSON_OBJECT(
                'primary', JSON_ARRAY(JSON_OBJECT('id', 'fd-m-1', 'title', '高中数学必修（函数专题）', 'author', '课程组', 'source', '校本教材', 'note', '主教材')),
                'references', JSON_ARRAY(JSON_OBJECT('id', 'fd-r-1', 'title', '导数题型精讲', 'author', '林知夏', 'source', '教研资料', 'note', '课后拓展'))
            )
        ),
        '2026-03-10 09:30:00', '2026-04-10 09:30:00', 0
    ),
    (
        2, 1, '2026 二轮冲刺版', '2026春', 'final', 'active', NULL,
        '【测试数据】高考前冲刺使用。', '林知夏', '林知夏',
        JSON_OBJECT(
            'basicInfo', JSON_OBJECT('courseName', '函数与导数', 'credits', 4, 'hours', 48, 'instructor', '林知夏', 'majors', JSON_ARRAY('数学教育')),
            'knowledgeGoals', JSON_ARRAY(JSON_OBJECT('id', 'fd2-k-1', 'text', '巩固导数模型与函数综合题思路。')),
            'abilityGoals', JSON_ARRAY(JSON_OBJECT('id', 'fd2-a-1', 'text', '在限时环境下完成函数压轴题拆解。')),
            'schedule', JSON_ARRAY(
                JSON_OBJECT('id', 'fd2-s-1', 'weekLabel', '第1周', 'topic', '导数综合题拆分策略', 'hours', 4, 'teachingMethod', '讲授+案例分析', 'notes', '配套限时训练。', 'chapterLabel', '冲刺一'),
                JSON_OBJECT('id', 'fd2-s-2', 'weekLabel', '第2周', 'topic', '参数与不等式', 'hours', 4, 'teachingMethod', '讲授+讨论', 'notes', '强调边界分析。', 'chapterLabel', '冲刺二')
            ),
            'teachingMethods', JSON_OBJECT('selected', JSON_ARRAY('讲授', '讨论'), 'notes', '采用例题精讲与当堂反馈结合。'),
            'assessment', JSON_OBJECT(
                'usualPercentage', 40, 'midtermPercentage', 20, 'finalPercentage', 40,
                'usualItems', JSON_ARRAY(JSON_OBJECT('id', 'fd2-u-1', 'label', '限时训练', 'percentage', 20)),
                'notes', '每周一次专题测。'
            ),
            'materials', JSON_OBJECT(
                'primary', JSON_ARRAY(JSON_OBJECT('id', 'fd2-m-1', 'title', '函数与导数冲刺卷', 'author', '课程组', 'source', '校本题库', 'note', '')),
                'references', JSON_ARRAY()
            )
        ),
        '2026-03-11 10:00:00', '2026-03-15 10:00:00', 0
    ),
    (
        3, 1, '2025 秋统整版', '2025秋', 'final', 'archived', '2025-12-20 10:00:00',
        '【测试数据】上一年度归档版本。', '林知夏', '林知夏',
        JSON_OBJECT(
            'basicInfo', JSON_OBJECT('courseName', '函数与导数', 'credits', 4, 'hours', 64, 'instructor', '林知夏', 'majors', JSON_ARRAY('数学教育')),
            'knowledgeGoals', JSON_ARRAY(JSON_OBJECT('id', 'fd3-k-1', 'text', '掌握函数与导数核心概念与计算方法。')),
            'abilityGoals', JSON_ARRAY(JSON_OBJECT('id', 'fd3-a-1', 'text', '能够完成函数综合应用问题。')),
            'schedule', JSON_ARRAY(
                JSON_OBJECT('id', 'fd3-s-1', 'weekLabel', '第1周', 'topic', '函数基础', 'hours', 4, 'teachingMethod', '讲授', 'notes', '建立知识框架。', 'chapterLabel', '第一章'),
                JSON_OBJECT('id', 'fd3-s-2', 'weekLabel', '第2周', 'topic', '极限与连续', 'hours', 4, 'teachingMethod', '讲授+讨论', 'notes', '组织分组练习。', 'chapterLabel', '第一章'),
                JSON_OBJECT('id', 'fd3-s-3', 'weekLabel', '第3周', 'topic', '导数计算', 'hours', 4, 'teachingMethod', '讲授', 'notes', '强化计算规范。', 'chapterLabel', '第二章'),
                JSON_OBJECT('id', 'fd3-s-4', 'weekLabel', '第4周', 'topic', '导数应用', 'hours', 4, 'teachingMethod', '讲授+作业反馈', 'notes', '完成章节测评。', 'chapterLabel', '第二章')
            ),
            'teachingMethods', JSON_OBJECT('selected', JSON_ARRAY('讲授', '讨论', '作业反馈'), 'notes', '采用讲练结合模式。'),
            'assessment', JSON_OBJECT(
                'usualPercentage', 30, 'midtermPercentage', 20, 'finalPercentage', 50,
                'usualItems', JSON_ARRAY(JSON_OBJECT('id', 'fd3-u-1', 'label', '作业', 'percentage', 20)),
                'notes', '执行教研组统一方案。'
            ),
            'materials', JSON_OBJECT(
                'primary', JSON_ARRAY(JSON_OBJECT('id', 'fd3-m-1', 'title', '函数与导数教学讲义', 'author', '数学教研组', 'source', '校本资料', 'note', '')),
                'references', JSON_ARRAY()
            )
        ),
        '2025-09-01 10:00:00', '2025-09-01 10:00:00', 0
    ),
    (
        4, 1, '2026 协作试验版', '2026春', 'draft', 'active', NULL,
        '【测试数据】跨校协作版本，仅用于联合备课。', '赵明远', '赵明远',
        JSON_OBJECT(
            'basicInfo', JSON_OBJECT('courseName', '函数与导数', 'credits', 4, 'hours', 32, 'instructor', '赵明远', 'majors', JSON_ARRAY('数学教育')),
            'knowledgeGoals', JSON_ARRAY(),
            'abilityGoals', JSON_ARRAY(),
            'schedule', JSON_ARRAY(),
            'teachingMethods', JSON_OBJECT('selected', JSON_ARRAY(), 'notes', ''),
            'assessment', JSON_OBJECT('usualPercentage', 0, 'midtermPercentage', 0, 'finalPercentage', 0, 'usualItems', JSON_ARRAY(), 'notes', ''),
            'materials', JSON_OBJECT('primary', JSON_ARRAY(), 'references', JSON_ARRAY())
        ),
        '2026-03-20 09:00:00', '2026-04-01 09:00:00', 0
    ),
    (
        5, 2, '2026 春版', '2026春', 'final', 'active', NULL,
        '【测试数据】核心专题版。', '林知夏', '林知夏',
        JSON_OBJECT(
            'basicInfo', JSON_OBJECT('courseName', '立体几何', 'credits', 3, 'hours', 48, 'instructor', '林知夏', 'majors', JSON_ARRAY('数学教育')),
            'knowledgeGoals', JSON_ARRAY(JSON_OBJECT('id', 'sg-k-1', 'text', '理解空间直线与平面的基本位置关系。')),
            'abilityGoals', JSON_ARRAY(JSON_OBJECT('id', 'sg-a-1', 'text', '能够完成立体几何证明与计算题。')),
            'schedule', JSON_ARRAY(JSON_OBJECT('id', 'sg-s-1', 'weekLabel', '第1周', 'topic', '空间几何初步', 'hours', 4, 'teachingMethod', '讲授+讨论', 'notes', '建立空间想象能力。', 'chapterLabel', '第一章')),
            'teachingMethods', JSON_OBJECT('selected', JSON_ARRAY('讲授', '讨论'), 'notes', '使用模型演示辅助讲解。'),
            'assessment', JSON_OBJECT(
                'usualPercentage', 30, 'midtermPercentage', 20, 'finalPercentage', 50,
                'usualItems', JSON_ARRAY(JSON_OBJECT('id', 'sg-u-1', 'label', '作业', 'percentage', 15)),
                'notes', ''
            ),
            'materials', JSON_OBJECT(
                'primary', JSON_ARRAY(JSON_OBJECT('id', 'sg-m-1', 'title', '立体几何专题讲义', 'author', '林知夏', 'source', '校本资料', 'note', '')),
                'references', JSON_ARRAY()
            )
        ),
        '2026-03-12 08:20:00', '2026-03-25 08:20:00', 0
    ),
    (
        6, 3, '2026 秋版', '2026秋', 'final', 'active', NULL,
        '【测试数据】跨校协作版本。', '周晨', '周晨',
        JSON_OBJECT(
            'basicInfo', JSON_OBJECT('courseName', '概率与统计', 'credits', 4, 'hours', 64, 'instructor', '周晨', 'majors', JSON_ARRAY('应用统计')),
            'knowledgeGoals', JSON_ARRAY(JSON_OBJECT('id', 'ps-k-1', 'text', '掌握随机变量与分布的核心概念。')),
            'abilityGoals', JSON_ARRAY(JSON_OBJECT('id', 'ps-a-1', 'text', '能够完成常见统计推断任务。')),
            'schedule', JSON_ARRAY(JSON_OBJECT('id', 'ps-s-1', 'weekLabel', '第1周', 'topic', '随机事件与概率', 'hours', 4, 'teachingMethod', '讲授', 'notes', '', 'chapterLabel', '第一章')),
            'teachingMethods', JSON_OBJECT('selected', JSON_ARRAY('讲授'), 'notes', ''),
            'assessment', JSON_OBJECT(
                'usualPercentage', 40, 'midtermPercentage', 20, 'finalPercentage', 40,
                'usualItems', JSON_ARRAY(JSON_OBJECT('id', 'ps-u-1', 'label', '实验', 'percentage', 20)),
                'notes', ''
            ),
            'materials', JSON_OBJECT(
                'primary', JSON_ARRAY(JSON_OBJECT('id', 'ps-m-1', 'title', '概率论与数理统计', 'author', '盛骤', 'source', '高等教育出版社', 'note', '')),
                'references', JSON_ARRAY()
            )
        ),
        '2026-03-05 15:20:00', '2026-03-12 15:20:00', 0
    );
