CREATE TABLE question (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    type             VARCHAR(10)  NOT NULL COMMENT 'single|multiple|short|coding',
    subject_id       VARCHAR(50)  NOT NULL COMMENT '学科ID',
    chapter_id       VARCHAR(50)  NOT NULL COMMENT '章节ID',
    difficulty       VARCHAR(10)  NOT NULL DEFAULT 'easy' COMMENT 'easy|medium|hard',
    status           VARCHAR(10)  NOT NULL DEFAULT 'draft' COMMENT 'draft|published',
    stem             VARCHAR(500) NOT NULL COMMENT '题干',
    knowledge_point  VARCHAR(200) NOT NULL DEFAULT '' COMMENT '知识点',
    analysis         VARCHAR(1000) NOT NULL DEFAULT '' COMMENT '解析',
    content          JSON         NOT NULL COMMENT '题型内容JSON(选择/简答/编程)',
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted          TINYINT      NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='习题表';

INSERT INTO question (id, type, subject_id, chapter_id, difficulty, status, stem, knowledge_point, analysis, content, created_at, updated_at, deleted)
VALUES
(
    1, 'multiple', 'math', 'math-functions', 'hard', 'published',
    '关于二次函数图像的说法，哪些正确？', '二次函数',
    '关注开口方向、对称轴与顶点位置。',
    JSON_OBJECT(
        'options', JSON_ARRAY(
            JSON_OBJECT('key', 'A', 'text', '对称轴一定平行于 y 轴。', 'correct', true),
            JSON_OBJECT('key', 'B', 'text', '顶点一定在 x 轴上。', 'correct', false),
            JSON_OBJECT('key', 'C', 'text', 'a > 0 时图像开口向上。', 'correct', true),
            JSON_OBJECT('key', 'D', 'text', '图像一定经过原点。', 'correct', false)
        )
    ),
    '2026-03-29 08:20:00', '2026-03-29 08:20:00', 0
),
(
    2, 'single', 'it', 'it-syntax', 'easy', 'published',
    'Python 中用于定义列表的符号是？', '列表',
    '列表使用方括号包裹元素。',
    JSON_OBJECT(
        'options', JSON_ARRAY(
            JSON_OBJECT('key', 'A', 'text', '[]', 'correct', true),
            JSON_OBJECT('key', 'B', 'text', '{}', 'correct', false),
            JSON_OBJECT('key', 'C', 'text', '()', 'correct', false),
            JSON_OBJECT('key', 'D', 'text', '<>', 'correct', false)
        )
    ),
    '2026-03-30 09:10:00', '2026-03-30 09:10:00', 0
),
(
    3, 'short', 'math', 'math-geometry', 'easy', 'draft',
    '为什么平行线被截时内错角相等？', '平行线性质',
    '从同位角相等与角的转化关系入手作答。',
    JSON_OBJECT(
        'answer', '因为平行线与截线形成的同位角相等，而内错角可以转化为一组相等的同位角。',
        'scoringPoints', JSON_ARRAY('说明平行线前提', '指出同位角相等', '完成内错角转化')
    ),
    '2026-03-31 10:40:00', '2026-03-31 10:40:00', 0
),
(
    4, 'single', 'physics', 'physics-electric', 'easy', 'draft',
    '闭合电路后小灯泡发光的直接原因是什么？', '电流形成',
    '电路闭合后导体中形成定向移动的电荷。',
    JSON_OBJECT(
        'options', JSON_ARRAY(
            JSON_OBJECT('key', 'A', 'text', '电流通过灯丝产生热和光。', 'correct', true),
            JSON_OBJECT('key', 'B', 'text', '导线变长。', 'correct', false),
            JSON_OBJECT('key', 'C', 'text', '电池重量增加。', 'correct', false),
            JSON_OBJECT('key', 'D', 'text', '空气压强变大。', 'correct', false)
        )
    ),
    '2026-04-01 09:15:00', '2026-04-01 09:15:00', 0
),
(
    5, 'coding', 'it', 'it-algorithm', 'hard', 'draft',
    '统计题库中各题型数量', 'Map 计数',
    '适合考察遍历、Map 累加和结果输出。',
    JSON_OBJECT(
        'prompt', '编写一个函数，统计题库列表中 single、multiple、short、coding 四种题型分别出现的次数。',
        'inputDescription', '输入一个题目对象数组，每个对象都包含 type 字段。',
        'outputDescription', '输出一个对象，键为题型，值为出现次数。',
        'examples', JSON_ARRAY(
            JSON_OBJECT('id', 'coding-example-01', 'input', '[{ type: "single" }, { type: "coding" }, { type: "single" }]', 'output', '{ single: 2, coding: 1 }', 'explanation', '遍历数组时按题型累加即可。')
        ),
        'testCases', JSON_ARRAY(
            JSON_OBJECT('id', 'coding-test-01', 'input', '[{ type: "short" }, { type: "short" }]', 'output', '{ short: 2 }')
        ),
        'referenceSolution', '使用一个空对象或 Map，在遍历数组时以题型为键累加计数，最后返回统计结果。'
    ),
    '2026-04-02 11:05:00', '2026-04-02 11:05:00', 0
),
(
    6, 'multiple', 'math', 'math-functions', 'medium', 'published',
    '下列哪些关系能表示函数？', '函数定义',
    '同一个自变量只能对应唯一的函数值。',
    JSON_OBJECT(
        'options', JSON_ARRAY(
            JSON_OBJECT('key', 'A', 'text', '每个 x 只对应一个 y 的对应关系。', 'correct', true),
            JSON_OBJECT('key', 'B', 'text', '同一个 x 对应两个不同的 y。', 'correct', false),
            JSON_OBJECT('key', 'C', 'text', '班级人数与学号的对应。', 'correct', true),
            JSON_OBJECT('key', 'D', 'text', '一个学生对应多个座位号。', 'correct', false)
        )
    ),
    '2026-04-03 14:20:00', '2026-04-03 14:20:00', 0
),
(
    7, 'short', 'physics', 'physics-electric', 'medium', 'published',
    '简述串联电路中电流的特点。', '串联电路',
    '突出各处电流相等这一核心结论。',
    JSON_OBJECT(
        'answer', '串联电路中各处电流都相等，因为电荷通过各元件时的流量保持一致。',
        'scoringPoints', JSON_ARRAY('指出各处电流相等', '说明原因与电荷连续性有关')
    ),
    '2026-04-04 08:45:00', '2026-04-04 08:45:00', 0
),
(
    8, 'single', 'math', 'math-functions', 'medium', 'published',
    '函数 y = 2x + 1 的图像经过下列哪个点？', '一次函数',
    '将选项坐标代入函数表达式验证。',
    JSON_OBJECT(
        'options', JSON_ARRAY(
            JSON_OBJECT('key', 'A', 'text', '(0, 0)', 'correct', false),
            JSON_OBJECT('key', 'B', 'text', '(1, 3)', 'correct', true),
            JSON_OBJECT('key', 'C', 'text', '(2, 1)', 'correct', false),
            JSON_OBJECT('key', 'D', 'text', '(-1, 2)', 'correct', false)
        )
    ),
    '2026-04-05 12:30:00', '2026-04-05 12:30:00', 0
),
(
    9, 'multiple', 'it', 'it-syntax', 'medium', 'draft',
    '以下哪些变量名符合 Python 标识符规则？', '变量名',
    '关键字、数字开头和连字符都不合法。',
    JSON_OBJECT(
        'options', JSON_ARRAY(
            JSON_OBJECT('key', 'A', 'text', 'score_total', 'correct', true),
            JSON_OBJECT('key', 'B', 'text', '2ndValue', 'correct', false),
            JSON_OBJECT('key', 'C', 'text', '_cache', 'correct', true),
            JSON_OBJECT('key', 'D', 'text', 'user-name', 'correct', false)
        )
    ),
    '2026-04-06 13:10:00', '2026-04-06 13:10:00', 0
),
(
    10, 'single', 'physics', 'physics-force', 'easy', 'published',
    '下列哪个物理量属于矢量？', '矢量与标量',
    '速度既有大小也有方向。',
    JSON_OBJECT(
        'options', JSON_ARRAY(
            JSON_OBJECT('key', 'A', 'text', '路程', 'correct', false),
            JSON_OBJECT('key', 'B', 'text', '速度', 'correct', true),
            JSON_OBJECT('key', 'C', 'text', '时间', 'correct', false),
            JSON_OBJECT('key', 'D', 'text', '质量', 'correct', false)
        )
    ),
    '2026-04-07 10:25:00', '2026-04-07 10:25:00', 0
),
(
    11, 'short', 'math', 'math-functions', 'medium', 'draft',
    '说明一次函数图像与斜率之间的关系。', '一次函数',
    '从斜率符号和绝对值两个维度概括。',
    JSON_OBJECT(
        'answer', '斜率决定直线的倾斜方向和倾斜程度，斜率越大，图像越陡。',
        'scoringPoints', JSON_ARRAY('说明斜率决定倾斜方向', '说明斜率绝对值影响陡峭程度')
    ),
    '2026-04-08 15:45:00', '2026-04-08 15:45:00', 0
),
(
    12, 'coding', 'it', 'it-algorithm', 'hard', 'published',
    '实现二分查找并返回目标下标', '二分查找',
    '适合考察有序数组、双指针收缩和边界处理。',
    JSON_OBJECT(
        'prompt', '给定一个升序整数数组和目标值，返回目标值所在下标；若不存在则返回 -1。',
        'inputDescription', '输入一个升序整数数组 nums，以及一个整数 target。',
        'outputDescription', '输出目标值在数组中的下标；不存在时输出 -1。',
        'examples', JSON_ARRAY(
            JSON_OBJECT('id', 'coding-example-12', 'input', 'nums = [1, 3, 5, 7, 9], target = 7', 'output', '3', 'explanation', '目标值 7 位于数组下标 3。')
        ),
        'testCases', JSON_ARRAY(
            JSON_OBJECT('id', 'coding-test-12', 'input', 'nums = [2, 4, 6, 8], target = 5', 'output', '-1')
        ),
        'referenceSolution', '维护 left 和 right 指针，取中点比较后缩小搜索区间，直到找到目标或区间为空。'
    ),
    '2026-04-10 15:20:00', '2026-04-10 15:20:00', 0
);
