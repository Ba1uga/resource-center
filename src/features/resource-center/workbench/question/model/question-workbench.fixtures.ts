import type {
  QuestionChapterOption,
  QuestionRecord,
  QuestionSelectOption,
} from './question-workbench.types.ts'

export const questionWorkbenchSubjectOptions: QuestionSelectOption[] = [
  { id: 'math', label: '数学' },
  { id: 'physics', label: '物理' },
  { id: 'it', label: '信息技术' },
]

export const questionWorkbenchChapterOptions: QuestionChapterOption[] = [
  { id: 'math-functions', subjectId: 'math', label: '函数与方程' },
  { id: 'math-geometry', subjectId: 'math', label: '平面几何' },
  { id: 'physics-force', subjectId: 'physics', label: '力与运动' },
  { id: 'physics-electric', subjectId: 'physics', label: '电路基础' },
  { id: 'it-syntax', subjectId: 'it', label: 'Python 基础语法' },
  { id: 'it-algorithm', subjectId: 'it', label: '算法与程序设计' },
]

export const questionWorkbenchSeedRecords: QuestionRecord[] = [
  {
    id: 'question-01',
    type: 'multiple',
    subjectId: 'math',
    chapterId: 'math-functions',
    difficulty: 'hard',
    status: 'published',
    stem: '关于二次函数图像的说法，哪些正确？',
    knowledgePoint: '二次函数',
    analysis: '关注开口方向、对称轴与顶点位置。',
    updatedAt: '2026-03-29T08:20:00.000Z',
    content: {
      options: [
        { key: 'A', text: '对称轴一定平行于 y 轴。', correct: true },
        { key: 'B', text: '顶点一定在 x 轴上。', correct: false },
        { key: 'C', text: 'a > 0 时图像开口向上。', correct: true },
        { key: 'D', text: '图像一定经过原点。', correct: false },
      ],
    },
  },
  {
    id: 'question-02',
    type: 'single',
    subjectId: 'it',
    chapterId: 'it-syntax',
    difficulty: 'easy',
    status: 'published',
    stem: 'Python 中用于定义列表的符号是？',
    knowledgePoint: '列表',
    analysis: '列表使用方括号包裹元素。',
    updatedAt: '2026-03-30T09:10:00.000Z',
    content: {
      options: [
        { key: 'A', text: '[]', correct: true },
        { key: 'B', text: '{}', correct: false },
        { key: 'C', text: '()', correct: false },
        { key: 'D', text: '<>', correct: false },
      ],
    },
  },
  {
    id: 'question-03',
    type: 'short',
    subjectId: 'math',
    chapterId: 'math-geometry',
    difficulty: 'easy',
    status: 'draft',
    stem: '为什么平行线被截时内错角相等？',
    knowledgePoint: '平行线性质',
    analysis: '从同位角相等与角的转化关系入手作答。',
    updatedAt: '2026-03-31T10:40:00.000Z',
    content: {
      answer: '因为平行线与截线形成的同位角相等，而内错角可以转化为一组相等的同位角。',
      scoringPoints: ['说明平行线前提', '指出同位角相等', '完成内错角转化'],
    },
  },
  {
    id: 'question-04',
    type: 'single',
    subjectId: 'physics',
    chapterId: 'physics-electric',
    difficulty: 'easy',
    status: 'draft',
    stem: '闭合电路后小灯泡发光的直接原因是什么？',
    knowledgePoint: '电流形成',
    analysis: '电路闭合后导体中形成定向移动的电荷。',
    updatedAt: '2026-04-01T09:15:00.000Z',
    content: {
      options: [
        { key: 'A', text: '电流通过灯丝产生热和光。', correct: true },
        { key: 'B', text: '导线变长。', correct: false },
        { key: 'C', text: '电池重量增加。', correct: false },
        { key: 'D', text: '空气压强变大。', correct: false },
      ],
    },
  },
  {
    id: 'question-05',
    type: 'coding',
    subjectId: 'it',
    chapterId: 'it-algorithm',
    difficulty: 'hard',
    status: 'draft',
    stem: '统计题库中各题型数量',
    knowledgePoint: 'Map 计数',
    analysis: '适合考察遍历、Map 累加和结果输出。',
    updatedAt: '2026-04-02T11:05:00.000Z',
    content: {
      prompt: '编写一个函数，统计题库列表中 single、multiple、short、coding 四种题型分别出现的次数。',
      inputDescription: '输入一个题目对象数组，每个对象都包含 type 字段。',
      outputDescription: '输出一个对象，键为题型，值为出现次数。',
      examples: [
        {
          id: 'coding-example-01',
          input: '[{ type: "single" }, { type: "coding" }, { type: "single" }]',
          output: '{ single: 2, coding: 1 }',
          explanation: '遍历数组时按题型累加即可。',
        },
      ],
      testCases: [
        {
          id: 'coding-test-01',
          input: '[{ type: "short" }, { type: "short" }]',
          output: '{ short: 2 }',
        },
      ],
      referenceSolution:
        '使用一个空对象或 Map，在遍历数组时以题型为键累加计数，最后返回统计结果。',
    },
  },
  {
    id: 'question-06',
    type: 'multiple',
    subjectId: 'math',
    chapterId: 'math-functions',
    difficulty: 'medium',
    status: 'published',
    stem: '下列哪些关系能表示函数？',
    knowledgePoint: '函数定义',
    analysis: '同一个自变量只能对应唯一的函数值。',
    updatedAt: '2026-04-03T14:20:00.000Z',
    content: {
      options: [
        { key: 'A', text: '每个 x 只对应一个 y 的对应关系。', correct: true },
        { key: 'B', text: '同一个 x 对应两个不同的 y。', correct: false },
        { key: 'C', text: '班级人数与学号的对应。', correct: true },
        { key: 'D', text: '一个学生对应多个座位号。', correct: false },
      ],
    },
  },
  {
    id: 'question-07',
    type: 'short',
    subjectId: 'physics',
    chapterId: 'physics-electric',
    difficulty: 'medium',
    status: 'published',
    stem: '简述串联电路中电流的特点。',
    knowledgePoint: '串联电路',
    analysis: '突出各处电流相等这一核心结论。',
    updatedAt: '2026-04-04T08:45:00.000Z',
    content: {
      answer: '串联电路中各处电流都相等，因为电荷通过各元件时的流量保持一致。',
      scoringPoints: ['指出各处电流相等', '说明原因与电荷连续性有关'],
    },
  },
  {
    id: 'question-08',
    type: 'single',
    subjectId: 'math',
    chapterId: 'math-functions',
    difficulty: 'medium',
    status: 'published',
    stem: '函数 y = 2x + 1 的图像经过下列哪个点？',
    knowledgePoint: '一次函数',
    analysis: '将选项坐标代入函数表达式验证。',
    updatedAt: '2026-04-05T12:30:00.000Z',
    content: {
      options: [
        { key: 'A', text: '(0, 0)', correct: false },
        { key: 'B', text: '(1, 3)', correct: true },
        { key: 'C', text: '(2, 1)', correct: false },
        { key: 'D', text: '(-1, 2)', correct: false },
      ],
    },
  },
  {
    id: 'question-09',
    type: 'multiple',
    subjectId: 'it',
    chapterId: 'it-syntax',
    difficulty: 'medium',
    status: 'draft',
    stem: '以下哪些变量名符合 Python 标识符规则？',
    knowledgePoint: '变量名',
    analysis: '关键字、数字开头和连字符都不合法。',
    updatedAt: '2026-04-06T13:10:00.000Z',
    content: {
      options: [
        { key: 'A', text: 'score_total', correct: true },
        { key: 'B', text: '2ndValue', correct: false },
        { key: 'C', text: '_cache', correct: true },
        { key: 'D', text: 'user-name', correct: false },
      ],
    },
  },
  {
    id: 'question-10',
    type: 'single',
    subjectId: 'physics',
    chapterId: 'physics-force',
    difficulty: 'easy',
    status: 'published',
    stem: '下列哪个物理量属于矢量？',
    knowledgePoint: '矢量与标量',
    analysis: '速度既有大小也有方向。',
    updatedAt: '2026-04-07T10:25:00.000Z',
    content: {
      options: [
        { key: 'A', text: '路程', correct: false },
        { key: 'B', text: '速度', correct: true },
        { key: 'C', text: '时间', correct: false },
        { key: 'D', text: '质量', correct: false },
      ],
    },
  },
  {
    id: 'question-11',
    type: 'short',
    subjectId: 'math',
    chapterId: 'math-functions',
    difficulty: 'medium',
    status: 'draft',
    stem: '说明一次函数图像与斜率之间的关系。',
    knowledgePoint: '一次函数',
    analysis: '从斜率符号和绝对值两个维度概括。',
    updatedAt: '2026-04-08T15:45:00.000Z',
    content: {
      answer: '斜率决定直线的倾斜方向和倾斜程度，斜率越大，图像越陡。',
      scoringPoints: ['说明斜率决定倾斜方向', '说明斜率绝对值影响陡峭程度'],
    },
  },
  {
    id: 'question-12',
    type: 'coding',
    subjectId: 'it',
    chapterId: 'it-algorithm',
    difficulty: 'hard',
    status: 'published',
    stem: '实现二分查找并返回目标下标',
    knowledgePoint: '二分查找',
    analysis: '适合考察有序数组、双指针收缩和边界处理。',
    updatedAt: '2026-04-10T15:20:00.000Z',
    content: {
      prompt: '给定一个升序整数数组和目标值，返回目标值所在下标；若不存在则返回 -1。',
      inputDescription: '输入一个升序整数数组 nums，以及一个整数 target。',
      outputDescription: '输出目标值在数组中的下标；不存在时输出 -1。',
      examples: [
        {
          id: 'coding-example-12',
          input: 'nums = [1, 3, 5, 7, 9], target = 7',
          output: '3',
          explanation: '目标值 7 位于数组下标 3。',
        },
      ],
      testCases: [
        {
          id: 'coding-test-12',
          input: 'nums = [2, 4, 6, 8], target = 5',
          output: '-1',
        },
      ],
      referenceSolution:
        '维护 left 和 right 指针，取中点比较后缩小搜索区间，直到找到目标或区间为空。',
    },
  },
]

export function getQuestionSubjectLabel(subjectId: string): string {
  return questionWorkbenchSubjectOptions.find((option) => option.id === subjectId)?.label ?? '未分类学科'
}

export function getQuestionChapterLabel(chapterId: string): string {
  return questionWorkbenchChapterOptions.find((option) => option.id === chapterId)?.label ?? '未分类章节'
}

export function getQuestionChapterOptions(subjectId: string): QuestionSelectOption[] {
  if (!subjectId) {
    return []
  }

  return questionWorkbenchChapterOptions
    .filter((option) => option.subjectId === subjectId)
    .map((option) => ({ id: option.id, label: option.label }))
}
