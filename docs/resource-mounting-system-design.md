# 教育资源智能挂载系统 — 架构设计文档

> **版本**: v1.0 | **日期**: 2026-05-23 | **作者**: AI 架构设计

---

## 目录

1. [系统整体架构](#一系统整体架构)
2. [AI自动挂载核心流程](#二ai自动挂载核心流程)
3. [教育资源智能识别设计](#三教育资源智能识别设计)
4. [知识体系建模](#四知识体系建模)
5. [AI挂载策略设计](#五ai挂载策略设计)
6. [置信度与审核机制](#六置信度与审核机制)
7. [多智能体设计](#七多智能体设计)
8. [技术栈方案](#八技术栈方案)
9. [数据库设计](#九数据库设计)
10. [接口设计](#十接口设计)
11. [异步任务设计](#十一异步任务设计)
12. [RAG设计](#十二rag设计)
13. [可扩展性设计](#十三可扩展性设计)
14. [后期优化方向](#十四后期优化方向)

---

## 一、系统整体架构

### 1.1 模块边界与微服务划分

```
┌─────────────────────────────────────────────────────────────────────┐
│                    学习系统 (Learning System)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ 课程管理  │  │ 章节管理  │  │ 知识点管理 │  │ 学习路径引擎     │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘   │
│       │              │              │                  │             │
│       └──────────────┴──────────────┴──────────────────┘             │
│                              │                                       │
│                    knowledge_graph (知识图谱)                         │
│                              │                                       │
│                    ┌─────────┴─────────┐                             │
│                    │ 知识图谱查询 API   │                             │
│                    └─────────┬─────────┘                             │
└──────────────────────────────┼──────────────────────────────────────┘
                               │ REST / MQ
┌──────────────────────────────┼──────────────────────────────────────┐
│              资源中台 (Resource Center)                              │
│                              │                                       │
│  ┌───────────────────────────┴───────────────────────────┐          │
│  │              资源挂载模块 (Resource Mounting)           │          │
│  │                                                        │          │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐   │          │
│  │  │ 资源解析层   │  │ AI 服务层   │  │ 挂载决策层   │   │          │
│  │  │ Parse Layer │  │ AI Layer    │  │ Mount Layer  │   │          │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘   │          │
│  │         │                │                │            │          │
│  │  ┌──────┴────────────────┴────────────────┴───────┐    │          │
│  │  │              数据访问层 (Data Access)            │    │          │
│  │  │  MySQL │ Redis │ Elasticsearch │ Milvus/pgvector│    │          │
│  │  └────────────────────────────────────────────────┘    │          │
│  └────────────────────────────────────────────────────────┘          │
│                                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ 教材管理  │  │ 课件管理  │  │ 习题管理  │  │ 视频管理  │             │
│  │ textbook │  │courseware│  │ question │  │  video   │             │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘             │
└──────────────────────────────────────────────────────────────────────┘
```

### 1.2 模块内部架构

资源挂载模块内部采用**分层 + 管道(Pipeline)**架构：

```
资源输入
   │
   ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. 资源解析管道 (Resource Parse Pipeline)                    │
│    ├── OCR Agent        (图片/PDF文字提取)                   │
│    ├── Document Parser  (Word/PDF/Markdown 解析)             │
│    ├── Video Transcriber(视频语音转文字)                     │
│    ├── MetadataExtractor(元数据提取: 标题/作者/关键词)        │
│    └── ContentChunker   (智能分块)                           │
└──────────────────────────┬──────────────────────────────────┘
                           │ 结构化内容
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. AI 分析管道 (AI Analysis Pipeline)                        │
│    ├── CourseClassifier    (课程分类)                        │
│    ├── ChapterLocator      (章节定位)                        │
│    ├── KnowledgePointMatch (知识点匹配)                       │
│    ├── DifficultyEstimator (难度评估)                        │
│    ├── CompetencyMapper    (能力点映射)                       │
│    └── QuestionTypeTagger  (题型标注)                        │
└──────────────────────────┬──────────────────────────────────┘
                           │ 候选挂载点列表
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. 挂载决策管道 (Mount Decision Pipeline)                    │
│    ├── RuleEngine         (规则引擎: 确定性匹配)              │
│    ├── EmbeddingMatcher   (向量语义匹配)                     │
│    ├── LLMReasoner        (大模型推理匹配)                    │
│    ├── Reranker           (重排序融合)                       │
│    └── ConfidenceScorer   (置信度综合评分)                    │
└──────────────────────────┬──────────────────────────────────┘
                           │ 挂载决策 + 置信度
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. 审核与反馈管道 (Review & Feedback Pipeline)               │
│    ├── AutoApproveRule    (高置信度自动审批)                  │
│    ├── HumanReviewQueue   (人工审核队列)                     │
│    ├── FeedbackCollector  (审核反馈收集)                     │
│    └── ModelFineTuner     (反馈数据用于模型优化)              │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 与学习系统的交互方式

```
资源中台                         学习系统
────────                        ────────
① 查询知识图谱 ──── REST ────→  GET /api/knowledge-graph/tree?course=xxx
② 提交挂载结果 ──── REST ────→  POST /api/knowledge-graph/mount-resource
③ 知识图谱变更 ──── MQ ──────←  KnowledgeGraphChangedEvent
④ 资源变更通知 ──── MQ ──────→  ResourceMountedEvent
⑤ 查询课程体系 ──── REST ────→  GET /api/courses/{id}/structure
```

**关键原则**: 资源中台不直接写学习系统的数据库。挂载结果通过 API/MQ 通知学习系统，由学习系统确认后写入知识图谱。

---

## 二、AI自动挂载核心流程

### 2.1 完整挂载链路

```
┌──────────────────────────────────────────────────────────────────┐
│                    资源智能挂载完整链路                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ① 资源上传                                                        │
│     │  用户上传 PDF/Word/PPT/视频/Markdown                         │
│     │  存储到 MinIO，生成 asset_id                                  │
│     │  创建 resource_info 记录，状态 = pending_parse                │
│     ▼                                                              │
│  ② 文档解析 (异步)                                                  │
│     │  PDF → OCR / 文本提取                                        │
│     │  Word → 段落结构化提取                                        │
│     │  PPT → 幻灯片逐页提取                                         │
│     │  视频 → 语音转文字 (ASR) → 文本                               │
│     │  Markdown → 结构化解析                                        │
│     ▼                                                              │
│  ③ 智能分块 (Chunking)                                              │
│     │  按语义边界分块 (Semantic Chunking)                           │
│     │  每块 500-1500 tokens                                         │
│     │  保留上下文重叠 10%                                           │
│     │  生成 chunk 元数据 (页号/章节标题/位置)                        │
│     ▼                                                              │
│  ④ 元数据提取 (Metadata Extraction)                                 │
│     │  LLM 提取: 标题/作者/关键词/学科/摘要                         │
│     │  规则提取: 页数/格式/大小/创建时间                            │
│     │  存储到 resource_metadata 表                                  │
│     ▼                                                              │
│  ⑤ 向量化 (Embedding)                                              │
│     │  每个 chunk → Embedding Model → 768/1536 维向量              │
│     │  BGE-large-zh / text2vec-large-chinese                      │
│     │  存储到 pgvector (小规模) 或 Milvus (大规模)                  │
│     │  同时存储到 Elasticsearch (全文检索)                          │
│     ▼                                                              │
│  ⑥ 课程匹配 (Course Matching)                                       │
│     │  多路召回:                                                    │
│     │    - 元数据课程字段 → 精确匹配                                │
│     │    - 资源向量 vs 课程向量 → 语义匹配                          │
│     │    - LLM 推理 → "这份资源属于什么课程？"                       │
│     │  融合排序 → 输出 Top-N 候选课程                               │
│     ▼                                                              │
│  ⑦ 章节匹配 (Chapter/Section Matching)                              │
│     │  ① 向量检索: 资源chunk向量 → 检索知识图谱章节向量              │
│     │  ② 关键词匹配: 提取关键词 → 匹配章节标题                       │
│     │  ③ 目录结构匹配: 资源目录 → 课程章节树                         │
│     │  ④ LLM推理: "这份资源属于第几章第几节？"                       │
│     ▼                                                              │
│  ⑧ 知识点匹配 (Knowledge Point Matching)                            │
│     │  ① Embedding 相似度: chunk向量 vs 知识点向量                   │
│     │  ② 关键词Jaccard: 资源关键词 vs 知识点名称                     │
│     │  ③ LLM深度匹配: 逐chunk分析匹配的知识点                        │
│     │  ④ 细粒度匹配到能力点/学习目标                                 │
│     ▼                                                              │
│  ⑨ 综合评分 (Confidence Scoring)                                    │
│     │  ┌──────────┬──────────┬──────────┬──────────┐               │
│     │  │ 规则引擎  │ 向量匹配  │ LLM推理  │ 关键词    │               │
│     │  │ weight:1  │ weight:2  │ weight:3 │ weight:1  │               │
│     │  └──────────┴──────────┴──────────┴──────────┘               │
│     │  加权融合 → 综合置信度 (0~1)                                  │
│     │  confidence ≥ 0.85 → 自动挂载                                │
│     │  confidence 0.6~0.85 → 推荐挂载(人工确认)                    │
│     │  confidence < 0.6 → 仅作参考                                  │
│     ▼                                                              │
│  ⑩ 挂载执行 (Mount Execution)                                       │
│     │  自动挂载: 高置信度直接创建挂载关系                             │
│     │  推荐挂载: 创建候选 + 推送人工审核                             │
│     │  通知学习系统: 发送 ResourceMountedEvent                      │
│     ▼                                                              │
│  ⑪ 人工审核 (Human Review)                                          │
│     │  审核员查看 AI 推荐 → 确认/修改/驳回                          │
│     │  审核结果反馈到 feedback_record                               │
│     │  驳回记录可用于:                                              │
│     │    - Reranker 微调样本                                        │
│     │    - LLM Prompt 优化                                          │
│     │    - 规则引擎补充                                             │
│     ▼                                                              │
│  ⑫ 最终入库                                                         │
│      resource_mount_relation 状态 = confirmed                      │
│      学习系统知识图谱更新                                           │
│                                                                     │
└──────────────────────────────────────────────────────────────────┘
```

### 2.2 每环节数据结构

| 环节 | 输入 | 输出 | 存储 |
|------|------|------|------|
| ① 上传 | MultipartFile | asset_id, resource_info.id | resource_asset, resource_info |
| ② 解析 | asset_id (MinIO key) | parsed_text (全文) | resource_content |
| ③ 分块 | parsed_text | List\<Chunk\> | resource_chunk |
| ④ 元数据提取 | parsed_text + 资源基本信息 | ResourceMetadata | resource_metadata |
| ⑤ 向量化 | List\<Chunk\> | List\<float[]\> | resource_embedding (pgvector) |
| ⑥ 课程匹配 | metadata + embedding | List\<CourseCandidate\> | mount_candidate (target_type=course) |
| ⑦ 章节匹配 | chunks + course_id | List\<ChapterCandidate\> | mount_candidate (target_type=chapter) |
| ⑧ 知识点匹配 | chunks + chapter_id | List\<KPCandidate\> | mount_candidate (target_type=knowledge_point) |
| ⑨ 综合评分 | 多路结果 | confidence_score | mount_decision |
| ⑩ 挂载执行 | mount_decision | mount_relation | resource_mount_relation |
| ⑪ 审核 | review action | review_record | mount_review_record |
| ⑫ 入库 | confirmed relation | knowledge_graph update | (学习系统侧) |

---

## 三、教育资源智能识别设计

### 3.1 资源类型识别策略

资源上传时，AI需要回答以下问题：

| 问题 | 识别方式 | 技术 |
|------|----------|------|
| 属于什么课程？ | 元数据 + 语义 + LLM | Prompt + Embedding + Rule |
| 属于哪个章节？ | 目录匹配 + 语义匹配 | Embedding + TreeMatch |
| 属于哪个知识点？ | 内容语义匹配 | Embedding + Rerank + LLM |
| 什么能力层级？ | Bloom分类 | LLM Prompt |
| 什么难度？ | 内容复杂度分析 | LLM Prompt + 规则 |
| 什么题型？ | 结构识别 | 规则 + LLM Prompt |
| 什么适用场景？ | 语义推断 | LLM Prompt |

### 3.2 Prompt 方案

#### 3.2.1 课程分类 Prompt

```
你是一位教育内容分类专家。请分析以下教学资源的元数据，判断它属于哪门课程。

## 已知课程列表
{course_list_json}

## 资源元数据
- 标题: {title}
- 作者: {author}
- 关键词: {keywords}
- 内容摘要: {summary}
- 文件类型: {file_type}

## 要求
1. 从已知课程中选择最匹配的课程(不超过3个)
2. 为每个匹配提供置信度(high/medium/low)和推理依据
3. 如果资源可能跨越多个课程,标注为"跨课程"

返回JSON格式,不要任何额外文字:
```json
{
  "matches": [
    {
      "courseId": "course_id",
      "courseName": "课程名",
      "confidence": "high",
      "reasoning": "推理依据"
    }
  ],
  "isCrossCourse": false
}
```
```

#### 3.2.2 知识点匹配 Prompt

```
你是一位教学知识图谱专家。请分析以下资源内容片段，匹配最相关的知识点。

## 资源内容
{chunk_text}

## 候选知识点(来自已定位的章节)
{knowledge_points_json}

## 要求
1. 为资源内容匹配最相关的知识点(不超过5个)
2. 每个匹配给出:
   - 置信度(high/medium/low)
   - 匹配类型: exact_match(精确匹配) / partial_match(部分匹配) / related(相关)
   - 匹配依据(引用资源中的具体内容)
3. 如果资源内容包含习题,标注题型和难度

返回JSON格式:
```json
{
  "matches": [
    {
      "knowledgePointId": 1,
      "knowledgePointName": "知识点名",
      "confidence": "high",
      "matchType": "exact_match",
      "evidence": "资源中出现的具体内容...",
      "coverage": 0.8
    }
  ],
  "questionInfo": null
}
```
```

#### 3.2.3 难度评估 Prompt

```
你是一位教育评估专家。请评估以下教学资源的难度等级。

## 资源信息
- 标题: {title}
- 内容摘要: {summary}
- 目标受众: {target_audience}

## Bloom认知层级
1 = 记忆 (识记、回忆)
2 = 理解 (解释、举例)
3 = 应用 (执行、实施)
4 = 分析 (区别、组织)
5 = 评价 (检查、评论)
6 = 创造 (生成、规划)

## 难度等级
- beginner: 入门级,无需前置知识
- intermediate: 中级,需要基础前置知识
- advanced: 高级,需要深入前置知识
- expert: 专家级,前沿或专题内容

返回JSON:
```json
{
  "difficulty": "intermediate",
  "bloomLevel": 3,
  "prerequisites": ["前置知识点1", "前置知识点2"],
  "estimatedStudyHours": 2.5,
  "reasoning": "评估依据"
}
```
```

### 3.3 Embedding 方案

```
┌─────────────────────────────────────────────────────────────────┐
│                      Embedding 方案设计                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  模型选择:                                                        │
│  ┌─────────────────────┬──────────┬──────────┬─────────────────┐ │
│  │ 模型                 │ 维度     │ 适用场景  │ 部署方式         │ │
│  ├─────────────────────┼──────────┼──────────┼─────────────────┤ │
│  │ BGE-large-zh-v1.5   │ 1024     │ 通用中文  │ 本地GPU/CPU      │ │
│  │ text2vec-large-chinese│ 1024   │ 句子级别  │ 本地部署          │ │
│  │ m3e-large            │ 1024    │ 中文语义  │ 本地部署          │ │
│  │ stella-base-zh-v3   │ 768      │ 轻量高效  │ 本地部署          │ │
│  │ BGE-M3              │ 1024     │ 多语言    │ 本地部署          │ │
│  └─────────────────────┴──────────┴──────────┴─────────────────┘ │
│                                                                   │
│  推荐方案: BGE-large-zh-v1.5 (教育领域中文最优)                    │
│  备选方案: BGE-M3 (如果需要多语言支持)                             │
│                                                                   │
│  部署架构:                                                        │
│  ┌──────────────┐   ┌──────────────────┐   ┌──────────────────┐  │
│  │ Spring Boot  │──▶│ Embedding Service│──▶│ pgvector/Milvus  │  │
│  │   应用        │   │ (Python Sidecar) │   │ 向量数据库        │  │
│  └──────────────┘   └──────────────────┘   └──────────────────┘  │
│                                                                   │
│  调用方式:                                                        │
│  - 方案A: Java 通过 HTTP 调用 Python Embedding 服务               │
│  - 方案B: 使用 ONNX Runtime 在 JVM 内推理 (性能较低但无依赖)       │
│  - 方案C: 调用外部 Embedding API (如阿里云/腾讯云)                 │
│  **推荐方案A**: 本地部署Embedding服务,Java通过HTTP调用              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 Rerank 方案

```
多路召回后,使用Reranker精排:

阶段一: 粗排 (最多100个候选)
  - 向量相似度 (cosine) 取 Top-100
  - 关键词 BM25 取 Top-50
  - 规则匹配 直接加入

阶段二: 精排 (Reranker)
  - 模型: BGE-Reranker-v2-m3 / bge-reranker-large
  - 对每个候选 (query, document) 对打分
  - 排序后取 Top-10

阶段三: 融合 (Fusion)
  - RRF (Reciprocal Rank Fusion)
  - score = Σ 1/(k + rank_i)  for each strategy i
  - k = 60 (经典参数)
```

### 3.5 Chunk 方案

```
┌─────────────────────────────────────────────────────────────────┐
│                       智能分块方案                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  策略一: 固定大小分块 (对通用文本)                                  │
│  - chunk_size: 500 tokens                                        │
│  - overlap: 50 tokens (10%)                                      │
│  - 适用于: 教材、PDF、Word                                        │
│                                                                   │
│  策略二: 语义分块 (对结构化文档)                                   │
│  - 按段落/章节/标题 边界分块                                       │
│  - 使用 Embedding 相似度检测语义边界                               │
│  - chunk_size 动态变化 200~1500 tokens                            │
│  - 适用于: PPT、Markdown、教案                                    │
│                                                                   │
│  策略三: 习题分块 (对题库)                                         │
│  - 每题一个 chunk                                                 │
│  - 保留: 题干 + 选项 + 答案 + 解析                                 │
│  - 适用于: question                                               │
│                                                                   │
│  策略四: 视频分块 (对视频)                                         │
│  - 按时间窗口 + 语义边界分块                                       │
│  - 每个 chunk 对应 30s~120s 的字幕片段                             │
│  - 保留时间戳索引                                                 │
│  - 适用于: video                                                   │
│                                                                   │
│  元数据增强 (每个chunk都附带):                                     │
│  {                                                                │
│    "chunk_id": "uuid",                                           │
│    "resource_id": 123,                                           │
│    "resource_type": "textbook",                                  │
│    "page_number": 45,           // 页号(教材/PDF)                 │
│    "slide_number": 12,          // 幻灯片号(PPT)                  │
│    "timestamp": [120, 180],     // 时间段(视频)                   │
│    "section_title": "第三章 栈与队列",  // 章节标题                │
│    "chunk_index": 5,                                              │
│    "total_chunks": 20,                                            │
│    "token_count": 450,                                            │
│    "content_type": "definition"  // definition|example|exercise|explanation│
│  }                                                                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.6 多路召回方案

```
                    资源 Chunk
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
   ┌─────────┐    ┌──────────┐    ┌──────────┐
   │ 向量召回 │    │ 关键词召回│    │ 规则召回  │
   │ (路1)   │    │ (路2)    │    │ (路3)    │
   └────┬────┘    └────┬─────┘    └────┬─────┘
        │              │               │
        │ chunk向量     │ BM25/TF-IDF   │ 元数据匹配
        │ vs           │ vs            │ 课程名=课程名
        │ 知识点向量   │ 知识点名称     │ 章节号匹配
        │              │               │
        ▼               ▼               ▼
   Top-100          Top-50          确定性结果
        │              │               │
        └──────────────┼───────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  RRF 融合        │
              │  score = Σ 1/(k+rank_i)│
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  Reranker 精排   │
              │  BGE-Reranker   │
              └────────┬────────┘
                       │
                       ▼
                  Top-10 候选
```

### 3.7 Hybrid Search 方案

```
结合 Elasticsearch (全文检索) + pgvector/Milvus (向量检索):

Java 侧实现:
┌──────────────────────────────────────────────────────────────┐
│  HybridSearchService                                         │
│                                                              │
│  search(QueryRequest request):                               │
│    1. 并行调用:                                              │
│       - vectorSearch(queryEmbedding, topK=50)                │
│       - fullTextSearch(queryText, topK=30)                   │
│       - ruleMatch(metadata)                                  │
│                                                              │
│    2. 融合:                                                  │
│       - RRF (Reciprocal Rank Fusion)                        │
│                                                              │
│    3. 精排:                                                  │
│       - Reranker rerank(query, fusedResults)                │
│                                                              │
│    4. 返回 Top-N                                             │
└──────────────────────────────────────────────────────────────┘
```

---

## 四、知识体系建模

### 4.1 学习系统知识体系模型

```
课程 (Course)
  │
  ├── 章 (Chapter) ─── 教学周/单元
  │     │
  │     ├── 节 (Section) ─── 单次课时
  │     │     │
  │     │     ├── 知识点 (Knowledge Point) ─── 原子知识单元
  │     │     │     ├── 定义
  │     │     │     ├── 前置知识点
  │     │     │     ├── 难度等级
  │     │     │     └── Bloom 认知层级
  │     │     │
  │     │     ├── 能力点 (Competency Point) ─── 可测量的技能
  │     │     │     ├── 能力描述
  │     │     │     ├── 掌握标准
  │     │     │     └── 评估方式
  │     │     │
  │     │     ├── 学习目标 (Learning Objective)
  │     │     │     ├── 目标描述
  │     │     │     ├── 达成指标
  │     │     │     └── 关联知识点
  │     │     │
  │     │     ├── 习题 (Exercise)
  │     │     │     ├── 题型
  │     │     │     ├── 难度
  │     │     │     └── 关联知识点
  │     │     │
  │     │     └── 推荐资源 (Recommended Resource)
  │     │           ├── 资源类型
  │     │           ├── 资源ID (引用资源中台)
  │     │           └── 挂载置信度
  │     │
  │     └── ...
  │
  └── ...
```

### 4.2 教育知识图谱设计

```
┌─────────────────────────────────────────────────────────────────┐
│                    教育知识图谱 (Knowledge Graph)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  节点类型:                                                        │
│  ┌────────────┬──────────────────────────────────────────────┐   │
│  │ 节点类型    │ 属性                                        │   │
│  ├────────────┼──────────────────────────────────────────────┤   │
│  │ Course     │ id, name, description, department, semester  │   │
│  │ Chapter    │ id, name, order, course_id                   │   │
│  │ Section    │ id, name, order, chapter_id                  │   │
│  │ KnowledgeP │ id, name, description, difficulty, bloom_level│  │
│  │ Competency │ id, name, description, assessment_criteria   │   │
│  │ Objective  │ id, description, kp_ids, indicators           │   │
│  │ Resource   │ id, type, title (引用资源中台)               │   │
│  │ Question   │ id, type, difficulty, stem (引用资源中台)    │   │
│  └────────────┴──────────────────────────────────────────────┘   │
│                                                                   │
│  关系类型:                                                        │
│  ┌──────────────────┬────────────────────────────────────────┐   │
│  │ 关系              │ 含义                                    │   │
│  ├──────────────────┼────────────────────────────────────────┤   │
│  │ HAS_CHAPTER      │ 课程 → 章                               │   │
│  │ HAS_SECTION      │ 章 → 节                                 │   │
│  │ HAS_KP           │ 节 → 知识点                             │   │
│  │ PREREQUISITE_OF  │ 知识点A → 知识点B (前置依赖)            │   │
│  │ BELONGS_TO       │ 资源 → 知识点 (挂载关系)                │   │
│  │ TESTS            │ 习题 → 知识点 (考察关系)                │   │
│  │ SUPPORTS         │ 资源 → 能力点 (支撑关系)                │   │
│  │ RELATED_TO       │ 知识点 → 知识点 (相关关系)              │   │
│  │ PARENT_OF        │ 知识点 → 子知识点 (父子关系)            │   │
│  └──────────────────┴────────────────────────────────────────┘   │
│                                                                   │
│  MySQL存储 (关系型核心):                                          │
│  - knowledge_node (节点表)                                        │
│  - knowledge_relation (关系表)                                    │
│  - knowledge_tree_closure (闭包表, 快速子树查询)                  │
│                                                                   │
│  Neo4j存储 (可选图分析):                                          │
│  - 复杂路径查询 (学习路径规划)                                     │
│  - 子图匹配 (知识体系完整性检查)                                   │
│  - 中心度分析 (核心知识点识别)                                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 为什么资源挂载本质上是"语义到节点"的匹配

```
资源挂载的核心问题:

资源 R = {标题T, 内容C₁, C₂, ..., Cₙ, 元数据M}
知识图谱 G = (V, E)  其中 V = {课程, 章, 节, 知识点, 能力点, ...}

挂载 = 找到最合适的映射: f: R → V*

即: 为资源R的每个语义单元,找到知识图谱中最匹配的节点。

为什么不是简单分类？
- 分类: 资源 → 类别 (1:N, 粗粒度)
- 挂载: 资源语义 → 图谱节点 (M:N, 细粒度, 有层次约束)

例如:
一本《数据结构》教材：
  - 第3章"栈与队列" → 挂载到 数据结构 > 线性结构 > 栈与队列 节点
  - 第3.2节"栈的应用" → 挂载到 栈 > 栈的应用 知识点
  - 习题"中缀转后缀" → 挂载到 栈 > 表达式求值 能力点

本质上是:
  对资源的每个结构化片段,在知识图谱中找到语义最匹配的节点,
  并满足层级约束(习题不直接挂载到课程节点,教材可以)。
```

---

## 五、AI挂载策略设计

### 5.1 策略总览

```
┌─────────────────────────────────────────────────────────────────┐
│                   多策略融合挂载引擎                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ 策略1:       │  │ 策略2:       │  │ 策略3:       │           │
│  │ 规则引擎     │  │ Embedding    │  │ LLM 推理     │           │
│  │ Rule Engine  │  │ Semantic     │  │ LLM Reason   │           │
│  │              │  │ Match        │  │              │           │
│  │ 权重: 1.0    │  │ 权重: 2.0    │  │ 权重: 3.0    │           │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │
│         │                 │                 │                    │
│         └─────────────────┼─────────────────┘                    │
│                           │                                      │
│                           ▼                                      │
│                  ┌─────────────────┐                             │
│                  │ 策略4: Reranker │                             │
│                  │ 精排 + 融合     │                             │
│                  └────────┬────────┘                             │
│                           │                                      │
│                           ▼                                      │
│                  ┌─────────────────┐                             │
│                  │ 综合置信度评估   │                             │
│                  │ + 挂载决策      │                             │
│                  └─────────────────┘                             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 策略1: 规则引擎挂载

```java
/**
 * 规则引擎 — 处理确定性匹配场景
 * 适用条件: 元数据中包含明确的课程/章节信息
 */
@Component
public class RuleBasedMountEngine {

    /**
     * 规则优先级从高到低:
     *
     * R1: 资源.course 字段 == 知识图谱.课程名 → 直接挂载到课程
     * R2: 资源标题包含 "第X章" 模式 → 提取章节号,匹配章节节点
     * R3: 资源标题包含知识点名称(完全匹配) → 直接匹配
     * R4: ISBN 匹配 → 教材自动关联课程
     * R5: 文件名包含课程编号(如 "CS101") → 匹配课程
     * R6: 资源文件所在目录名 = 课程名 → 匹配课程
     */
    public List<MountResult> applyRules(ResourceContext ctx, KnowledgeGraph graph) {
        List<MountResult> results = new ArrayList<>();

        // R1: 字段直接匹配
        if (StringUtils.hasText(ctx.getCourse())) {
            CourseNode course = graph.findCourseByName(ctx.getCourse());
            if (course != null) {
                results.add(MountResult.confident(course, 0.95,
                    "资源course字段直接匹配: " + ctx.getCourse()));
            }
        }

        // R2: 章节号提取
        Pattern chapterPattern = Pattern.compile("第([一二三四五六七八九十\\d]+)章");
        Matcher m = chapterPattern.matcher(ctx.getTitle());
        if (m.find()) {
            // 提取章节号并在知识图谱中定位
            String chapterNum = m.group(1);
            // ... 匹配逻辑
        }

        // R3: 知识点名称精确匹配
        // R4: ISBN匹配
        // ...

        return results;
    }
}
```

### 5.3 策略2: Embedding 语义匹配

```java
/**
 * Embedding 语义匹配引擎
 * 核心逻辑: 将资源内容向量化,与知识图谱节点向量做相似度检索
 */
@Service
public class EmbeddingMatchEngine {

    private final EmbeddingService embeddingService;  // HTTP调用Python Embedding服务
    private final VectorDatabase vectorDb;            // pgvector / Milvus

    /**
     * 执行语义匹配
     *
     * @param resourceChunks  资源的语义分块
     * @param scope           搜索范围 (课程/章节/知识点)
     * @param parentNodeId    父节点ID (限制了搜索范围)
     */
    public List<SemanticMatchResult> match(
            List<ResourceChunk> resourceChunks,
            MatchScope scope,
            Long parentNodeId) {

        // 1. 对每个chunk做向量化
        List<float[]> chunkEmbeddings = resourceChunks.stream()
                .map(chunk -> embeddingService.encode(chunk.getContent()))
                .toList();

        // 2. 计算资源级向量 (平均池化)
        float[] resourceVector = averagePooling(chunkEmbeddings);

        // 3. 向量检索
        List<VectorSearchResult> candidates = vectorDb.search(
                resourceVector,
                scope,          // 搜索范围: knowledge_point / chapter / course
                parentNodeId,   // 父节点ID过滤
                50              // Top-K
        );

        // 4. 对每个chunk也做细粒度匹配
        Map<Long, Double> kpScoreMap = new HashMap<>();
        for (float[] chunkEmb : chunkEmbeddings) {
            List<VectorSearchResult> chunkMatches = vectorDb.search(
                    chunkEmb, scope, parentNodeId, 10);
            for (VectorSearchResult match : chunkMatches) {
                kpScoreMap.merge(match.getNodeId(), match.getScore(), Math::max);
            }
        }

        return buildResults(kpScoreMap, candidates);
    }
}
```

### 5.4 策略3: LLM推理挂载

```java
/**
 * LLM推理挂载引擎
 * 让LLM深入理解资源内容后,直接推理挂载位置
 */
@Service
public class LLMReasoningMountEngine {

    private final RestClient llmClient;
    private final AiMatchingConfig config;

    /**
     * 分阶段LLM推理:
     * Stage 1: 课程定位 → 确定资源属于哪门课
     * Stage 2: 章节定位 → 确定属于第几章第几节
     * Stage 3: 知识点匹配 → 确定匹配的具体知识点
     * Stage 4: 细粒度标注 → 能力点、难度、Bloom层级
     *
     * 为什么不一次性完成?
     * - 每个阶段候选集缩小,提高准确率
     * - 每个阶段的Prompt可以独立优化
     * - 失败时可以只重试某一阶段
     */
    public LLMMountResult reason(ResourceContext ctx, KnowledgeGraph graph) {

        // Stage 1: 课程
        List<CourseCandidate> courses = classifyCourse(ctx);

        // Stage 2: 章节 (在每个候选课程下)
        List<ChapterCandidate> chapters = locateChapter(ctx, courses);

        // Stage 3: 知识点
        List<KPCandidate> kps = matchKnowledgePoints(ctx, chapters);

        // Stage 4: 细粒度
        FineGrainedAnalysis fineGrained = analyzeFineGrained(ctx, kps);

        return LLMMountResult.builder()
                .courses(courses)
                .chapters(chapters)
                .knowledgePoints(kps)
                .fineGrained(fineGrained)
                .build();
    }

    /**
     * Stage 1 Prompt 设计 (见3.2.1)
     */
    private List<CourseCandidate> classifyCourse(ResourceContext ctx) { /* ... */ }

    /**
     * Stage 2 Prompt:
     * "资源内容: {chunks_summary}
     *  候选课程: {course} 的章节树: {chapter_tree_json}
     *  请判断资源属于哪些章节..."
     */
    private List<ChapterCandidate> locateChapter(ResourceContext ctx,
            List<CourseCandidate> courses) { /* ... */ }

    /**
     * Stage 3 Prompt (见3.2.2)
     */
    private List<KPCandidate> matchKnowledgePoints(ResourceContext ctx,
            List<ChapterCandidate> chapters) { /* ... */ }
}
```

### 5.5 策略4: 多策略融合

```java
/**
 * 多策略融合引擎 — 综合所有策略的输出,给出最终挂载决策
 */
@Service
public class FusionMountEngine {

    private final RuleBasedMountEngine ruleEngine;
    private final EmbeddingMatchEngine embeddingEngine;
    private final LLMReasoningMountEngine llmEngine;
    private final RerankerService reranker;

    /**
     * 融合策略配置:
     * ┌──────────────┬──────────┬─────────────────────────────┐
     * │ 策略          │ 权重     │ 适用场景                     │
     * ├──────────────┼──────────┼─────────────────────────────┤
     * │ 规则引擎      │ 1.0      │ 始终运行,确定性匹配           │
     * │ Embedding语义 │ 2.0      │ 有内容文本时运行              │
     * │ Chunk级Embed  │ 1.5      │ 有多个分块时运行              │
     * │ LLM推理       │ 3.0      │ 关键决策时运行(有成本)        │
     * │ 关键词BM25    │ 1.0      │ 始终运行,BM25检索             │
     * └──────────────┴──────────┴─────────────────────────────┘
     */
    public FusionResult fuse(ResourceContext ctx, KnowledgeGraph graph) {

        // 1. 并行执行所有策略
        CompletableFuture<List<MountResult>> ruleFuture =
                CompletableFuture.supplyAsync(() -> ruleEngine.applyRules(ctx, graph));

        CompletableFuture<List<SemanticMatchResult>> embedFuture =
                CompletableFuture.supplyAsync(() -> embeddingEngine.match(
                        ctx.getChunks(), MatchScope.KNOWLEDGE_POINT, null));

        CompletableFuture<LLMMountResult> llmFuture =
                CompletableFuture.supplyAsync(() -> llmEngine.reason(ctx, graph));

        // 2. 等待所有结果
        CompletableFuture.allOf(ruleFuture, embedFuture, llmFuture).join();

        List<MountResult> ruleResults = ruleFuture.join();
        List<SemanticMatchResult> embedResults = embedFuture.join();
        LLMMountResult llmResults = llmFuture.join();

        // 3. 融合评分
        // 对每个候选知识点,计算综合得分
        Map<Long, FusionScore> scoreMap = new HashMap<>();

        // 规则引擎结果 (高置信度 → 直接高分)
        for (MountResult r : ruleResults) {
            scoreMap.merge(r.getNodeId(),
                new FusionScore(r.getConfidence() * 1.0, "rule"),
                FusionScore::merge);
        }

        // Embedding结果
        for (SemanticMatchResult r : embedResults) {
            scoreMap.merge(r.getNodeId(),
                new FusionScore(r.getScore() * 2.0, "embedding"),
                FusionScore::merge);
        }

        // LLM结果
        for (KPCandidate kp : llmResults.getKnowledgePoints()) {
            double llmScore = convertConfidence(kp.getConfidence()); // high→0.9, medium→0.7, low→0.4
            scoreMap.merge(kp.getKpId(),
                new FusionScore(llmScore * 3.0, "llm"),
                FusionScore::merge);
        }

        // 4. 排序
        List<Map.Entry<Long, FusionScore>> ranked = scoreMap.entrySet().stream()
                .sorted((a, b) -> Double.compare(b.getValue().getTotalScore(),
                        a.getValue().getTotalScore()))
                .toList();

        // 5. 生成最终决策
        return buildDecision(ranked, ctx);
    }

    /**
     * 决策阈值:
     * 综合分 ≥ 0.85 → 自动挂载
     * 综合分 0.6~0.85 → 推荐挂载
     * 综合分 < 0.6 → 低置信度,仅参考
     */
    private FusionResult buildDecision(List<Map.Entry<Long, FusionScore>> ranked,
            ResourceContext ctx) {
        // ...
    }
}
```

---

## 六、置信度与审核机制

### 6.1 Human-in-the-Loop 设计

```
┌─────────────────────────────────────────────────────────────────┐
│                  Human-in-the-Loop 审核机制                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│                    ┌──────────────┐                               │
│                    │  AI 挂载结果 │                               │
│                    └──────┬───────┘                               │
│                           │                                       │
│              ┌────────────┼────────────┐                          │
│              ▼            ▼            ▼                          │
│        confidence     confidence    confidence                    │
│        ≥ 0.85        0.6 ~ 0.85    < 0.6                         │
│              │            │            │                          │
│              ▼            ▼            ▼                          │
│        ┌─────────┐  ┌─────────┐  ┌─────────┐                     │
│        │ 自动挂载 │  │ 推荐挂载 │  │ 低置信度│                     │
│        │ (无需审核)│  │ (需审核) │  │ (仅供参考)│                   │
│        └────┬────┘  └────┬────┘  └────┬────┘                     │
│             │            │            │                          │
│             ▼            ▼            ▼                          │
│        ┌──────┐    ┌──────────┐  ┌──────────┐                    │
│        │ 入库  │    │ 审核队列  │  │ 失败记录 │                    │
│        └──────┘    └────┬─────┘  └────┬─────┘                    │
│                         │             │                          │
│                    ┌────┼────┐        │                          │
│                    ▼    ▼    ▼        │                          │
│               确认  修改  驳回        │                          │
│                    │    │    │        │                          │
│                    ▼    ▼    ▼        ▼                          │
│               ┌──────────────────────────┐                       │
│               │     feedback_record      │                       │
│               │  (审核员修正 = 高质量标签)│                       │
│               └────────────┬─────────────┘                       │
│                            │                                      │
│                            ▼                                      │
│               ┌──────────────────────────┐                       │
│               │    反馈闭环               │                       │
│               │                           │                       │
│               │  ① Prompt 优化            │                       │
│               │  ② Reranker 微调样本      │                       │
│               │  ③ Embedding 模型微调     │                       │
│               │  ④ 规则引擎补充           │                       │
│               │  ⑤ 知识图谱补全           │                       │
│               └──────────────────────────┘                       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 置信度计算模型

```java
/**
 * 综合置信度计算
 *
 * 六个维度加权:
 * ┌─────────────────────┬──────────┬─────────────────────────────┐
 * │ 维度                 │ 权重     │ 说明                         │
 * ├─────────────────────┼──────────┼─────────────────────────────┤
 * │ embeddingSimilarity │ 0.20     │ 向量余弦相似度              │
 * │ llmConfidence       │ 0.25     │ LLM自身的置信度声明          │
 * │ ruleMatchPremium    │ 0.15     │ 规则匹配的加分               │
 * │ evidenceStrength    │ 0.15     │ 匹配证据的强度               │
 * │ consistencyCheck    │ 0.15     │ 多策略结果一致性             │
 * │ historicalAccuracy  │ 0.10     │ 历史类似资源挂载准确率       │
 * └─────────────────────┴──────────┴─────────────────────────────┘
 */
public class ConfidenceCalculator {

    public double calculate(MountDecision decision) {
        double score = 0.0;

        // 1. 向量相似度
        score += 0.20 * normalizeCosine(decision.getEmbeddingSimilarity());

        // 2. LLM置信度
        score += 0.25 * convertLLMConfidence(decision.getLlmConfidence());

        // 3. 规则匹配加分
        score += 0.15 * decision.getRuleMatchScore();

        // 4. 证据强度 (LLM引用的具体证据数量和质量)
        score += 0.15 * decision.getEvidenceStrength();

        // 5. 多策略一致性 (各策略结果的Kendall tau系数)
        score += 0.15 * decision.getConsistencyScore();

        // 6. 历史准确率
        score += 0.10 * decision.getHistoricalAccuracy();

        return Math.min(1.0, score);
    }
}
```

### 6.3 审核反馈训练闭环

```
审核员操作: 确认 / 修改 / 驳回
    │
    ▼
feedback_record 记录:
  - 原始AI推荐: {kp1: 0.72, kp2: 0.65, kp3: 0.40}
  - 审核员选择: kp2 (修改为手动选择)
  - 修正原因: "PPT内容虽然有kp1的术语,但核心讲的是kp2的应用"
  - 审核员ID, 时间戳
    │
    ▼
反馈利用:
  ① Prompt优化: 收集驳回案例,分析LLM错误模式,优化Prompt
  ② Reranker微调: (query, positive_doc, negative_doc) 三元组
  ③ Embedding微调: 使用审核员确认的(资源, 知识点)对做对比学习
  ④ 规则补充: 分析驳回模式,新增确定性规则
```

---

## 七、多智能体设计

### 7.1 Agent 协作架构

```
┌─────────────────────────────────────────────────────────────────┐
│              资源挂载多智能体协作系统                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                    Orchestrator Agent                      │    │
│  │              (编排Agent — 协调所有子Agent)                  │    │
│  └──────┬───────┬───────┬───────┬───────┬───────────────────┘    │
│         │       │       │       │       │                         │
│         ▼       ▼       ▼       ▼       ▼                         │
│  ┌─────────┐┌────────┐┌───────┐┌───────┐┌──────────┐            │
│  │OCR      ││Parse   ││Course ││KP     ││Rerank   │            │
│  │Agent    ││Agent   ││Match  ││Match  ││Agent    │            │
│  │         ││        ││Agent  ││Agent  ││         │            │
│  │图片→文字││文档→   ││资源→  ││内容→  ││重排序   │            │
│  │         ││结构化  ││课程   ││知识点 ││融合     │            │
│  └─────────┘└────────┘└───────┘└───────┘└──────────┘            │
│                                                                   │
│  ┌─────────┐┌────────┐┌───────────────────────────────────┐      │
│  │Audit    ││Recommend││          Memory / Context          │      │
│  │Agent    ││Agent   ││  共享上下文 (跨Agent状态共享)       │      │
│  │         ││        ││                                    │      │
│  │置信度   ││挂载    ││  resourceContext, courseCandidates, │      │
│  │审核     ││推荐    ││  chapterCandidates, kpCandidates,   │      │
│  │         ││        ││  finalDecision                     │      │
│  └─────────┘└────────┘└───────────────────────────────────┘      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Agent 职责定义

```java
/**
 * Agent 接口定义
 */
public interface MountAgent<TInput, TOutput> {
    String getName();
    TOutput execute(TInput input, AgentContext context);
    boolean isApplicable(TInput input);  // 判断是否需要执行此Agent
}

/**
 * 1. OCR Agent
 *    职责: 从图片/扫描PDF中提取文字
 *    触发条件: 文件类型 = PDF(扫描件) 或 图片
 *    输入: asset_id (MinIO文件路径)
 *    输出: 提取的文本 + 位置信息
 *    实现: Tesseract OCR / PaddleOCR (中文优化)
 */
public class OcrAgent implements MountAgent<OcrRequest, OcrResult> { }

/**
 * 2. Resource Parse Agent
 *    职责: 解析不同格式的文档,提取结构化内容
 *    触发条件: 所有新上传资源
 *    输入: asset_id + 文件类型
 *    输出: ParsedDocument (结构化文本 + 元数据)
 *    实现: Apache POI (Word/PPT), PDFBox (PDF), Flexmark (Markdown)
 */
public class ResourceParseAgent implements MountAgent<ParseRequest, ParsedDocument> { }

/**
 * 3. Course Match Agent
 *    职责: 判断资源属于哪门课程
 *    触发条件: 资源解析完成
 *    输入: ParsedDocument + 知识图谱课程列表
 *    输出: List<CourseCandidate>
 *    实现: 规则 + Embedding + LLM 三路
 */
public class CourseMatchAgent implements MountAgent<ParseResult, List<CourseCandidate>> { }

/**
 * 4. Knowledge Match Agent
 *    职责: 判断资源匹配哪些知识点
 *    触发条件: Course Match 完成后
 *    输入: ParsedDocument + 课程下的知识点列表
 *    输出: List<KPCandidate>
 *    实现: Embedding + LLM + Reranker
 */
public class KnowledgeMatchAgent implements MountAgent<KPMatchRequest, List<KPCandidate>> { }

/**
 * 5. Rerank Agent
 *    职责: 对多路召回结果重排序融合
 *    触发条件: 多路匹配完成后
 *    输入: 各路候选结果
 *    输出: 排序后的融合结果
 *    实现: BGE-Reranker + RRF
 */
public class RerankAgent implements MountAgent<RerankRequest, List<FusedResult>> { }

/**
 * 6. Audit Agent
 *    职责: 计算置信度,生成审核建议
 *    触发条件: 挂载决策完成后
 *    输入: 挂载决策 + 各路原始结果
 *    输出: AuditResult (置信度 + 审核等级 + 是否需要人工审核)
 *    实现: 规则 + ML
 */
public class AuditAgent implements MountAgent<MountDecision, AuditResult> { }

/**
 * 7. Recommendation Agent
 *    职责: 基于挂载结果,生成资源使用建议
 *    触发条件: 挂载确认后
 *    输入: 最终挂载关系
 *    输出: 资源推荐 (给教师/学生的使用建议)
 *    实现: LLM
 */
public class RecommendationAgent implements MountAgent<MountRelation, Recommendation> { }
```

### 7.3 Orchestrator Agent (编排器)

```java
/**
 * 编排Agent — 协调所有子Agent的执行
 *
 * 设计思路:
 * - 不依赖 LangChain4j / Spring AI 的 Agent 框架(太重)
 * - 自行实现轻量级编排器
 * - 使用 CompletableFuture 并行执行独立Agent
 * - 使用 Spring Event 解耦Agent间通信
 */
@Service
public class MountOrchestrator {

    private final List<MountAgent<?, ?>> agents;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * 执行完整挂载流程
     */
    public MountResult executeFullPipeline(Long resourceId) {
        AgentContext context = new AgentContext();
        context.put("resourceId", resourceId);

        // Phase 1: 资源解析 (串行 — 依赖原始文件)
        ResourceContext resourceCtx = executeAgent(
                ResourceParseAgent.class, resourceId, context);
        context.put("resourceCtx", resourceCtx);

        // Phase 2: 课程匹配
        List<CourseCandidate> courses = executeAgent(
                CourseMatchAgent.class, resourceCtx, context);
        context.put("courses", courses);

        // Phase 3: 知识点匹配 + 章节匹配 (可并行)
        CompletableFuture<List<KPCandidate>> kpFuture = CompletableFuture.supplyAsync(
                () -> executeAgent(KnowledgeMatchAgent.class,
                        new KPMatchRequest(resourceCtx, courses), context));

        CompletableFuture<List<ChapterCandidate>> chapterFuture = CompletableFuture.supplyAsync(
                () -> executeAgent(ChapterMatchAgent.class,
                        new ChapterMatchRequest(resourceCtx, courses), context));

        List<KPCandidate> kps = kpFuture.join();
        List<ChapterCandidate> chapters = chapterFuture.join();

        // Phase 4: Rerank 融合
        List<FusedResult> fused = executeAgent(RerankAgent.class,
                new RerankRequest(kps, chapters, courses), context);

        // Phase 5: 审计
        AuditResult audit = executeAgent(AuditAgent.class,
                buildDecision(fused), context);

        // Phase 6: 自动挂载 或 推送审核
        if (audit.isAutoApprovable()) {
            executeMount(fused, context);
        } else {
            pushToReviewQueue(fused, audit, context);
        }

        // Phase 7: 推荐(可选)
        if (audit.isConfirmed()) {
            executeAgent(RecommendationAgent.class, buildRelation(fused), context);
        }

        return buildResult(fused, audit);
    }
}
```

### 7.4 技术选型分析

```
是否需要这些框架？

┌──────────────────────┬──────────┬──────────────────────────────┐
│ 框架                  │ 是否需要 │ 原因                          │
├──────────────────────┼──────────┼──────────────────────────────┤
│ LangChain4j          │ 可选     │ 如果用Function Calling可引入   │
│ Spring AI            │ 可选     │ 简化Embedding/VectorStore操作  │
│ LangGraph            │ 不需要   │ 太重量,自行编排足够            │
│ MCP                  │ 暂不需要 │ 目前没有跨系统Agent调用需求    │
│ Function Calling     │ 推荐     │ 用于LLM结构化输出              │
│ Spring Event         │ 推荐     │ Agent间解耦通信               │
│ CompletableFuture    │ 足够     │ 并行执行独立Agent             │
└──────────────────────┴──────────┴──────────────────────────────┘

推荐方案:
- 自行实现轻量编排器 (不引入LangChain4j/Spring AI等重框架)
- LLM调用继续使用 RestClient + 自定义Prompt (已验证可行)
- 引入Function Calling让LLM返回结构化JSON (提高解析可靠性)
- 使用Spring Event解耦Agent间通信
- 使用@Async + CompletableFuture实现并行
```

---

## 八、技术栈方案

### 8.1 完整技术栈

```yaml
核心框架:
  - Java 17
  - Spring Boot 3.5.x
  - Spring Cloud (如微服务化)
  - MyBatis-Plus 3.5.x

数据库:
  - MySQL 8.0 (业务数据)
  - Redis 7.x (缓存 + 任务队列)
  - Elasticsearch 8.x (全文检索)
  - pgvector (向量存储, PostgreSQL扩展) 或 Milvus (大规模向量)

消息队列:
  - RabbitMQ (异步任务 + 系统间通信)

存储:
  - MinIO (文件存储)

AI相关:
  - DeepSeek API (LLM — 已有)
  - OpenAI Compatible API (备用)
  - BGE-large-zh-v1.5 (Embedding, 本地部署)
  - BGE-Reranker-v2-m3 (Reranker, 本地部署)
  - PaddleOCR (OCR, 本地部署)
  - FunASR / Whisper (语音转文字, 可选)

文档解析:
  - Apache POI (Word/PPT)
  - Apache PDFBox (PDF)
  - Flexmark (Markdown)
  - Tika (通用元数据提取)

新增依赖 (pom.xml):
  - spring-boot-starter-data-redis
  - spring-boot-starter-amqp (RabbitMQ)
  - spring-boot-starter-data-elasticsearch
  - pgvector-spring-boot-starter (或手动管理)
  - minio (MinIO Java SDK)
  - tika-core + tika-parsers
```

### 8.2 Embedding 服务部署 (Python Sidecar)

```
┌─────────────────────────────────────────────────────────────────┐
│                 Embedding 服务独立部署                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  为什么用Python Sidecar而不是Java?                                │
│  - BGE/Text2Vec 等模型主要在Python生态 (HuggingFace/sentence-     │
│    transformers)                                                  │
│  - ONNX Runtime在JVM推理性能/兼容性不如Python                     │
│  - 独立部署可独立扩缩                                             │
│                                                                   │
│  embedding-service/                                               │
│  ├── Dockerfile                                                   │
│  ├── requirements.txt    # sentence-transformers, fastapi, uvicorn│
│  ├── main.py             # FastAPI 服务                          │
│  └── models/             # 预下载的模型文件                       │
│                                                                   │
│  API:                                                            │
│  POST /embed                                                      │
│  Body: {"texts": ["文本1", "文本2"], "model": "bge-large-zh"}    │
│  Response: {"embeddings": [[0.1, 0.2, ...], [...]]}             │
│                                                                   │
│  POST /rerank                                                     │
│  Body: {"query": "查询文本", "documents": ["候选1", "候选2"]}     │
│  Response: {"scores": [0.92, 0.45], "ranked_indices": [0, 1]}   │
│                                                                   │
│  Java 侧调用:                                                     │
│  @Service                                                        │
│  public class EmbeddingService {                                 │
│      private final RestClient restClient;                        │
│                                                                   │
│      public float[] encode(String text) {                        │
│          return restClient.post()                                │
│              .uri("/embed")                                      │
│              .body(Map.of("texts", List.of(text)))               │
│              .retrieve()                                         │
│              .body(EmbeddingResponse.class)                      │
│              .getEmbeddings().get(0);                            │
│      }                                                           │
│  }                                                               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 九、数据库设计

### 9.1 现有表分析与修改建议

#### 需要修改的现有表:

**1. knowledge_point 表 (V7) — 需要大幅扩展**

当前结构过于扁平,只有 course + chapter + name 三个维度。需要扩展为层级结构:

```sql
-- V15: 重构 knowledge_point 为层级知识节点
ALTER TABLE knowledge_point
    ADD COLUMN parent_id BIGINT NULL COMMENT '父节点ID, 构建层级: 课程→章→节→知识点',
    ADD COLUMN node_type VARCHAR(20) NOT NULL DEFAULT 'knowledge_point'
        COMMENT 'course|chapter|section|knowledge_point|competency|objective',
    ADD COLUMN node_level TINYINT NOT NULL DEFAULT 3 COMMENT '层级深度: 1=课程 2=章 3=节 4=知识点',
    ADD COLUMN sort_order INT NOT NULL DEFAULT 0 COMMENT '同级排序',
    ADD COLUMN difficulty VARCHAR(20) NOT NULL DEFAULT '' COMMENT 'beginner|intermediate|advanced|expert',
    ADD COLUMN bloom_level TINYINT NULL COMMENT 'Bloom认知层级 1-6',
    ADD COLUMN keywords VARCHAR(500) NOT NULL DEFAULT '' COMMENT '关键词,逗号分隔',
    ADD COLUMN prerequisites JSON NULL COMMENT '前置知识点ID列表',
    ADD COLUMN embedding_id VARCHAR(64) NULL COMMENT '对应向量存储的ID',
    ADD COLUMN extra_meta JSON NULL COMMENT '扩展元数据',
    ADD INDEX idx_parent_id (parent_id),
    ADD INDEX idx_node_type (node_type),
    ADD INDEX idx_embedding_id (embedding_id);
```

**2. mapping_record 表 (V7) — 扩展挂载目标类型**

```sql
-- V16: 扩展 mapping_record 支持多层级挂载
ALTER TABLE mapping_record
    ADD COLUMN mount_target_type VARCHAR(20) NOT NULL DEFAULT 'knowledge_point'
        COMMENT '挂载目标类型: course|chapter|section|knowledge_point|competency',
    ADD COLUMN mount_target_id BIGINT NULL COMMENT '挂载目标节点ID(知识图谱)',
    ADD COLUMN mount_target_name VARCHAR(200) NOT NULL DEFAULT '' COMMENT '挂载目标名称',
    ADD COLUMN mount_path VARCHAR(500) NOT NULL DEFAULT ''
        COMMENT '完整挂载路径: 课程>章>节>知识点',
    ADD COLUMN auto_mounted TINYINT NOT NULL DEFAULT 0
        COMMENT '是否AI自动挂载: 0=人工, 1=AI自动',
    ADD COLUMN mount_confidence DECIMAL(5,4) NULL COMMENT '挂载综合置信度 0~1',
    ADD COLUMN mount_strategy VARCHAR(50) NOT NULL DEFAULT ''
        COMMENT '挂载策略: rule|embedding|llm|fusion',
    ADD COLUMN feedback_status VARCHAR(20) NOT NULL DEFAULT 'none'
        COMMENT '反馈状态: none|collected|applied',
    ADD INDEX idx_mount_target (mount_target_type, mount_target_id),
    ADD INDEX idx_auto_mounted (auto_mounted);
```

**3. mapping_candidate 表 — 扩展字段**

```sql
-- V17: 扩展 mapping_candidate
ALTER TABLE mapping_candidate
    ADD COLUMN match_strategy VARCHAR(20) NOT NULL DEFAULT 'llm'
        COMMENT '匹配策略: rule|embedding|llm|keyword',
    ADD COLUMN similarity_score DECIMAL(5,4) NULL COMMENT '向量相似度 0~1',
    ADD COLUMN evidence_snippet VARCHAR(1000) NOT NULL DEFAULT '' COMMENT '匹配证据(资源原文片段)',
    ADD COLUMN rank_position INT NOT NULL DEFAULT 0 COMMENT '排序位置';
```

### 9.2 新增核心表

**resource_content — 资源解析内容表**

```sql
-- V18: 资源解析内容表
CREATE TABLE resource_content (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    resource_type   VARCHAR(20) NOT NULL COMMENT 'article|courseware|question|video|excerpt',
    resource_id     BIGINT NOT NULL COMMENT '资源表主键',
    full_text       LONGTEXT NOT NULL COMMENT '解析后的完整文本',
    text_format     VARCHAR(20) NOT NULL DEFAULT 'plain' COMMENT 'plain|markdown|html',
    parse_status    VARCHAR(20) NOT NULL DEFAULT 'pending'
        COMMENT 'pending|parsing|completed|failed',
    parse_error     VARCHAR(1000) NOT NULL DEFAULT '' COMMENT '解析错误信息',
    word_count      INT NOT NULL DEFAULT 0 COMMENT '总字数',
    parsed_at       DATETIME NULL COMMENT '解析完成时间',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         TINYINT NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_resource (resource_type, resource_id),
    INDEX idx_parse_status (parse_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资源解析内容表';
```

**resource_chunk — 资源分块表**

```sql
-- V19: 资源分块表
CREATE TABLE resource_chunk (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    resource_type   VARCHAR(20) NOT NULL,
    resource_id     BIGINT NOT NULL,
    content_id      BIGINT NOT NULL COMMENT '关联 resource_content.id',
    chunk_index     INT NOT NULL COMMENT '分块序号(从0开始)',
    chunk_text      TEXT NOT NULL COMMENT '分块文本',
    token_count     INT NOT NULL DEFAULT 0 COMMENT 'token数',
    content_type    VARCHAR(20) NOT NULL DEFAULT 'general'
        COMMENT 'definition|example|exercise|explanation|summary',
    page_number     INT NULL COMMENT '页码(教材/PDF)',
    slide_number    INT NULL COMMENT '幻灯片号(PPT)',
    timestamp_start INT NULL COMMENT '视频起始秒',
    timestamp_end   INT NULL COMMENT '视频结束秒',
    section_title   VARCHAR(200) NOT NULL DEFAULT '' COMMENT '所在章节标题',
    embedding_id    VARCHAR(64) NULL COMMENT '向量存储ID',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         TINYINT NOT NULL DEFAULT 0,
    INDEX idx_resource (resource_type, resource_id),
    INDEX idx_content_id (content_id),
    INDEX idx_embedding_id (embedding_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资源分块表';
```

**resource_embedding — 向量存储表 (pgvector)**

```sql
-- V20: 资源向量表 (需要 pgvector 扩展)
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE resource_embedding (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    embedding_type VARCHAR(20) NOT NULL COMMENT 'resource|chunk|knowledge_point',
    target_id       BIGINT NOT NULL COMMENT '关联ID (resource_id / chunk_id / kp_id)',
    target_type     VARCHAR(20) NOT NULL COMMENT 'resource|chunk|knowledge_point',
    embedding       vector(1024) NOT NULL COMMENT 'BGE-large-zh 1024维向量',
    model_name      VARCHAR(50) NOT NULL COMMENT 'Embedding模型名',
    model_version   VARCHAR(20) NOT NULL COMMENT '模型版本',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted         TINYINT NOT NULL DEFAULT 0,
    INDEX idx_target (target_type, target_id),
    INDEX idx_embedding_type (embedding_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资源向量表(pgvector)';

-- 向量索引 (IVFFlat 用于近似搜索)
-- CREATE INDEX idx_embedding_vector ON resource_embedding
--     USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

**resource_mount_relation — 挂载关系表**

```sql
-- V21: 挂载关系表 (最终确认的挂载关系)
CREATE TABLE resource_mount_relation (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    resource_type       VARCHAR(20) NOT NULL COMMENT 'article|courseware|question|video',
    resource_id         BIGINT NOT NULL COMMENT '资源表主键',
    resource_title      VARCHAR(200) NOT NULL COMMENT '资源标题(冗余)',
    knowledge_node_id   BIGINT NOT NULL COMMENT '知识图谱节点ID',
    knowledge_node_type VARCHAR(20) NOT NULL COMMENT 'course|chapter|section|knowledge_point|competency',
    knowledge_node_name VARCHAR(200) NOT NULL COMMENT '节点名称(冗余)',
    mount_path          VARCHAR(500) NOT NULL DEFAULT '' COMMENT '完整路径',
    mount_source        VARCHAR(20) NOT NULL COMMENT 'ai_auto|ai_recommend|manual',
    confidence          DECIMAL(5,4) NULL COMMENT '挂载置信度',
    mapping_record_id   BIGINT NULL COMMENT '关联的映射记录ID',
    status              VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT 'active|deprecated|removed',
    mounted_by          VARCHAR(100) NOT NULL DEFAULT '' COMMENT '挂载人',
    mounted_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted             TINYINT NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_unique_mount (resource_type, resource_id, knowledge_node_id),
    INDEX idx_resource (resource_type, resource_id),
    INDEX idx_knowledge_node (knowledge_node_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资源挂载关系表';
```

**ai_mount_task — AI挂载任务表**

```sql
-- V22: AI挂载任务表
CREATE TABLE ai_mount_task (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_type           VARCHAR(30) NOT NULL COMMENT 'single_mount|batch_mount|remount|refresh',
    resource_type       VARCHAR(20) NULL COMMENT '单个任务时指定',
    resource_id         BIGINT NULL COMMENT '单个任务时指定',
    batch_id            BIGINT NULL COMMENT '关联的 mapping_batch.id',
    status              VARCHAR(20) NOT NULL DEFAULT 'queued'
        COMMENT 'queued|parsing|embedding|matching|reviewing|completed|failed|cancelled',
    priority            TINYINT NOT NULL DEFAULT 5 COMMENT '优先级 1(最高)-10(最低)',
    progress            DECIMAL(5,2) NOT NULL DEFAULT 0 COMMENT '进度百分比',
    current_phase       VARCHAR(30) NOT NULL DEFAULT '' COMMENT '当前阶段',
    phase_detail        VARCHAR(200) NOT NULL DEFAULT '' COMMENT '阶段详情',
    total_items         INT NOT NULL DEFAULT 0,
    completed_items     INT NOT NULL DEFAULT 0,
    failed_items        INT NOT NULL DEFAULT 0,
    error_message       TEXT NULL COMMENT '错误信息',
    config_snapshot     JSON NULL COMMENT '执行时的配置快照',
    started_at          DATETIME NULL,
    completed_at        DATETIME NULL,
    created_by          VARCHAR(100) NOT NULL DEFAULT '',
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted             TINYINT NOT NULL DEFAULT 0,
    INDEX idx_status (status),
    INDEX idx_resource (resource_type, resource_id),
    INDEX idx_batch_id (batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI挂载任务表';
```

**mount_review_record — 挂载审核记录表**

```sql
-- V23: 挂载审核记录表
CREATE TABLE mount_review_record (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id             BIGINT NULL COMMENT '关联 ai_mount_task.id',
    mapping_record_id   BIGINT NULL COMMENT '关联 mapping_record.id',
    mount_relation_id   BIGINT NULL COMMENT '关联 resource_mount_relation.id',
    review_action       VARCHAR(20) NOT NULL COMMENT 'approve|modify|reject|skip',
    original_node_id    BIGINT NULL COMMENT 'AI推荐的节点ID',
    original_node_name  VARCHAR(200) NOT NULL DEFAULT '',
    reviewed_node_id    BIGINT NULL COMMENT '审核后的节点ID',
    reviewed_node_name  VARCHAR(200) NOT NULL DEFAULT '',
    review_comment      VARCHAR(1000) NOT NULL DEFAULT '' COMMENT '审核意见',
    review_reason       VARCHAR(500) NOT NULL DEFAULT '' COMMENT '修改/驳回原因',
    ai_confidence       DECIMAL(5,4) NULL COMMENT 'AI原始置信度',
    reviewed_by         VARCHAR(100) NOT NULL COMMENT '审核人',
    reviewed_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    feedback_used       TINYINT NOT NULL DEFAULT 0 COMMENT '是否已用于反馈训练',
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted             TINYINT NOT NULL DEFAULT 0,
    INDEX idx_task_id (task_id),
    INDEX idx_reviewer (reviewed_by),
    INDEX idx_feedback_used (feedback_used)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='挂载审核记录表';
```

### 9.3 完整ER关系图

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  resource_info   │     │ resource_content  │     │  resource_chunk   │
│  (新表,统一定义) │1───1│  (V18)            │1───N│  (V19)            │
└────────┬─────────┘     └──────────────────┘     └────────┬─────────┘
         │                                                  │
         │                                                  │ 1:1
         │                                                  ▼
         │                                         ┌──────────────────┐
         │                                         │resource_embedding│
         │                                         │  (V20, pgvector) │
         │                                         └──────────────────┘
         │
         │ 1:N
         ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ mapping_record   │1───N│mapping_candidate │     │   ai_mount_task  │
│  (V7, V16扩展)  │     │  (V7, V17扩展)   │     │  (V22)           │
└────────┬─────────┘     └──────────────────┘     └────────┬─────────┘
         │                                                  │
         │ 1:1                                               │ 1:N
         ▼                                                  ▼
┌──────────────────┐                              ┌──────────────────┐
│resource_mount_    │                             │mount_review_record│
│relation (V21)    │                             │  (V23)           │
└────────┬─────────┘                             └──────────────────┘
         │
         │ N:1
         ▼
┌──────────────────┐
│ knowledge_node   │
│ (V15, 从         │
│  knowledge_point │
│  扩展而来)        │
└──────────────────┘
```

### 9.4 迁移文件清单

| 迁移版本 | 文件名 | 说明 |
|----------|--------|------|
| V15 | expand_knowledge_point.sql | 扩展 knowledge_point → knowledge_node |
| V16 | expand_mapping_record.sql | 扩展 mapping_record 支持多层级挂载 |
| V17 | expand_mapping_candidate.sql | 扩展 mapping_candidate 字段 |
| V18 | create_resource_content.sql | 新建资源解析内容表 |
| V19 | create_resource_chunk.sql | 新建资源分块表 |
| V20 | create_resource_embedding.sql | 新建向量表(pgvector) |
| V21 | create_resource_mount_relation.sql | 新建挂载关系表 |
| V22 | create_ai_mount_task.sql | 新建AI挂载任务表 |
| V23 | create_mount_review_record.sql | 新建挂载审核记录表 |

---

## 十、接口设计

### 10.1 API 概览

```
资源挂载模块 REST API:

┌─────────────────────────────────────────────────────────────────┐
│ Mount Task API (挂载任务)                                        │
├─────────────────────────────────────────────────────────────────┤
│ POST   /api/mount/tasks                   创建挂载任务            │
│ GET    /api/mount/tasks                   任务列表(分页)          │
│ GET    /api/mount/tasks/{id}              任务详情+进度            │
│ POST   /api/mount/tasks/{id}/cancel       取消任务                │
│ POST   /api/mount/tasks/{id}/retry        重试失败任务            │
│ POST   /api/mount/tasks/batch             批量创建挂载任务         │
├─────────────────────────────────────────────────────────────────┤
│ Mount Relation API (挂载关系)                                    │
├─────────────────────────────────────────────────────────────────┤
│ GET    /api/mount/relations               挂载关系列表(分页/过滤)  │
│ GET    /api/mount/relations/{id}          挂载关系详情            │
│ POST   /api/mount/relations               手动创建挂载关系         │
│ DELETE /api/mount/relations/{id}          移除挂载关系            │
│ PUT    /api/mount/relations/{id}/status   修改挂载状态            │
│ GET    /api/mount/relations/tree          按知识树查看挂载资源     │
├─────────────────────────────────────────────────────────────────┤
│ Mount Review API (挂载审核)                                      │
├─────────────────────────────────────────────────────────────────┤
│ GET    /api/mount/reviews                 审核列表                │
│ GET    /api/mount/reviews/{id}            审核详情                │
│ POST   /api/mount/reviews/{id}/approve   确认挂载                │
│ POST   /api/mount/reviews/{id}/modify    修改挂载                │
│ POST   /api/mount/reviews/{id}/reject    驳回挂载                │
│ GET    /api/mount/reviews/stats           审核统计                │
├─────────────────────────────────────────────────────────────────┤
│ Mount Intelligence API (智能挂载)                                │
├─────────────────────────────────────────────────────────────────┤
│ POST   /api/mount/intelligence/preview    AI挂载预览(不实际挂载)  │
│ POST   /api/mount/intelligence/suggest    获取挂载建议            │
│ POST   /api/mount/intelligence/search     语义搜索知识点          │
│ GET    /api/mount/intelligence/confidence/{id} 置信度详情         │
├─────────────────────────────────────────────────────────────────┤
│ Knowledge Node API (知识节点 — 同步自学习系统)                    │
├─────────────────────────────────────────────────────────────────┤
│ GET    /api/mount/knowledge-nodes         知识节点列表            │
│ GET    /api/mount/knowledge-nodes/{id}    知识节点详情            │
│ GET    /api/mount/knowledge-nodes/tree    知识树结构              │
│ GET    /api/mount/knowledge-nodes/search  搜索知识节点            │
├─────────────────────────────────────────────────────────────────┤
│ Provider API (AI Provider — 已有,保留)                           │
├─────────────────────────────────────────────────────────────────┤
│ GET    /api/mapping/provider              获取当前AI Provider     │
│ PUT    /api/mapping/provider              切换AI Provider        │
└─────────────────────────────────────────────────────────────────┘
```

### 10.2 关键接口详细设计

```java
/**
 * 创建挂载任务
 */
@PostMapping("/api/mount/tasks")
public R<MountTaskVO> createTask(@Valid @RequestBody CreateMountTaskRequest request) {
    // request: { resourceType, resourceId, priority, config }
    // resourceId 为空时表示批量任务
    // 返回: taskId, 前端通过 GET /tasks/{id} 轮询进度
}

/**
 * 挂载预览 (不实际写入,仅返回AI分析结果)
 */
@PostMapping("/api/mount/intelligence/preview")
public R<MountPreviewVO> preview(@Valid @RequestBody MountPreviewRequest request) {
    // request: { resourceType, resourceId }
    // 返回: 课程候选、章节候选、知识点候选、置信度、匹配证据
    // 不创建任何数据库记录
}

/**
 * 获取审核列表
 */
@GetMapping("/api/mount/reviews")
public R<Page<MountReviewVO>> listReviews(MountReviewPageRequest request) {
    // 过滤: status(pending/reviewed), confidence(min/max), resourceType
    // 排序: priority desc, confidence asc (低置信度优先审)
}
```

---

## 十一、异步任务设计

### 11.1 任务状态机

```
                    ┌──────────┐
                    │  QUEUED  │
                    └────┬─────┘
                         │ 开始处理
                         ▼
                    ┌──────────┐
              ┌─────│ PARSING  │─────┐
              │     └────┬─────┘     │
              │          │ 完成      │ 失败
              │          ▼           │
              │     ┌──────────┐     │
              │ ┌───│EMBEDDING │───┐ │
              │ │   └────┬─────┘   │ │
              │ │        │ 完成    │ │
              │ │        ▼         │ │
              │ │   ┌──────────┐   │ │
              │ │   │ MATCHING │   │ │
              │ │   └────┬─────┘   │ │
              │ │        │ 完成    │ │
              │ │        ▼         │ │
              │ │   ┌──────────┐   │ │
              │ │   │REVIEWING │   │ │
              │ │   └────┬─────┘   │ │
              │ │        │         │ │
              │ │   ┌────┼────┐    │ │
              │ │   ▼    ▼    ▼    │ │
              │ │ 自动  人工  驳回  │ │
              │ │   │    │    │    │ │
              │ │   └────┼────┘    │ │
              │ │        ▼         │ │
              │ │   ┌──────────┐   │ │
              │ │   │COMPLETED │   │ │
              │ │   └──────────┘   │ │
              │ │                  │ │
              │ └──────────────────┘ │
              │                      │
              ▼                      ▼
         ┌──────────┐          ┌──────────┐
         │  FAILED  │          │  FAILED  │
         └──────────┘          └──────────┘
              │                      │
              └──────────┬───────────┘
                         │ 重试
                         ▼
                    ┌──────────┐
                    │  QUEUED  │ (回到队列)
                    └──────────┘
```

### 11.2 异步实现

```java
/**
 * 使用 RabbitMQ 实现异步挂载任务
 *
 * 为什么用MQ而不是@Async?
 * - @Async 无法持久化任务状态
 * - @Async 服务重启丢失任务
 * - MQ 可以控制并发消费者数量
 * - MQ 支持死信队列(重试失败任务)
 * - MQ 便于监控任务积压
 */
@Component
public class MountTaskProcessor {

    private final RabbitTemplate rabbitTemplate;
    private final AiMountTaskMapper taskMapper;

    /**
     * 提交任务到队列
     */
    public void submitTask(Long taskId) {
        AiMountTask task = taskMapper.selectById(taskId);
        task.setStatus("queued");
        taskMapper.updateById(task);

        rabbitTemplate.convertAndSend(
                "mount.task.exchange",
                "mount.task." + task.getPriority(),
                new MountTaskMessage(taskId)
        );
    }

    /**
     * 消费任务
     */
    @RabbitListener(queues = "mount.task.queue")
    public void processTask(MountTaskMessage message) {
        Long taskId = message.getTaskId();
        AiMountTask task = taskMapper.selectById(taskId);

        try {
            // Phase 1: 解析
            updateTaskProgress(task, "parsing", 0.1, "开始文档解析...");
            ResourceContent content = resourceParseService.parse(task);
            updateTaskProgress(task, "parsing", 0.3, "文档解析完成");

            // Phase 2: 向量化
            updateTaskProgress(task, "embedding", 0.3, "开始向量化...");
            List<ResourceChunk> chunks = chunkService.chunk(content);
            embeddingService.batchEmbed(chunks);
            updateTaskProgress(task, "embedding", 0.5, "向量化完成");

            // Phase 3: AI匹配
            updateTaskProgress(task, "matching", 0.5, "开始AI匹配...");
            MountResult result = orchestrator.executePipeline(task);
            updateTaskProgress(task, "matching", 0.9, "AI匹配完成");

            // Phase 4: 决策
            if (result.getConfidence() >= 0.85) {
                // 自动挂载
                mountService.autoMount(result);
                task.setStatus("completed");
                updateTaskProgress(task, "completed", 1.0, "自动挂载完成");
            } else {
                // 推送审核
                task.setStatus("reviewing");
                updateTaskProgress(task, "reviewing", 0.95, "等待人工审核");
            }

        } catch (Exception e) {
            log.error("Mount task {} failed", taskId, e);
            task.setStatus("failed");
            task.setErrorMessage(e.getMessage());
            taskMapper.updateById(task);
        }
    }
}
```

---

## 十二、RAG设计

### 12.1 为什么需要RAG？

```
当前系统的局限:
- LLM匹配时,将所有知识点一次性塞入Prompt (上下文窗口浪费)
- 无法处理大规模知识点 (>1000个知识点时Prompt过长)
- Prompt过长 → 成本高 → 准确率下降

RAG方案:
- 将所有知识点向量化存储在向量数据库中
- 对于每个资源chunk,检索最相关的Top-K知识点
- 只将Top-K知识点 + 资源内容送入LLM
- 大幅减少Prompt长度,提高准确率,降低成本
```

### 12.2 RAG挂载流程

```
资源上传
   │
   ▼
文档解析 → Chunk文本
   │
   ▼
Chunk Embedding (向量化)
   │
   ▼
向量检索: chunk向量 → 检索知识图谱
   │  (在 pgvector/Milvus 中搜索最相似的 K 个知识点)
   │  Top-K = 10~20 个候选知识点
   │
   ▼
RAG增强: 资源Chunk + 候选知识点信息 → Prompt
   │  ┌──────────────────────────────────────────┐
   │  │ System: 你是一位教学资源匹配专家...       │
   │  │                                           │
   │  │ Context (检索到的知识点):                  │
   │  │ 1. [二叉树遍历] - 前序/中序/后序          │
   │  │ 2. [树的存储结构] - 顺序/链式             │
   │  │ ...                                       │
   │  │                                           │
   │  │ Resource Chunk:                           │
   │  │ "二叉树的前序遍历是指先访问根节点..."      │
   │  │                                           │
   │  │ Task: 判断该资源属于哪个知识点,说明理由     │
   │  └──────────────────────────────────────────┘
   │
   ▼
LLM推理 → 匹配结果
```

### 12.3 分层RAG

```
┌─────────────────────────────────────────────────────────────────┐
│                     分层RAG策略                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Layer 1 — 课程层 (粗召回)                                       │
│  - 资源标题/摘要向量 → 检索课程节点向量                           │
│  - Top-3 候选课程                                                 │
│                                                                   │
│  Layer 2 — 章节层 (中召回)                                        │
│  - 在每个候选课程下,检索章节节点                                  │
│  - 资源章节信息 + 向量相似度                                      │
│  - Top-5 候选章节                                                 │
│                                                                   │
│  Layer 3 — 知识点层 (细召回)                                      │
│  - 对每个资源chunk,在已定位章节下检索知识点                        │
│  - chunk向量 → Top-10 知识点                                      │
│  - 聚合所有chunk的匹配结果                                        │
│                                                                   │
│  Layer 4 — 能力点/学习目标 (精召回)                                │
│  - 在匹配的知识点下,检索关联的能力点和学习目标                     │
│  - LLM判断资源是否覆盖这些能力点                                   │
│                                                                   │
│  分层优势:                                                        │
│  - 每层检索空间指数递减                                           │
│  - 避免在全局搜索中迷失                                           │
│  - 符合教学体系的层级结构                                          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 十三、可扩展性设计

### 13.1 插件化挂载策略

```java
/**
 * 挂载策略接口 — 支持插件化扩展
 */
public interface MountStrategy {
    String getName();
    int getPriority();  // 执行优先级
    boolean supports(ResourceContext ctx);

    /**
     * @return 挂载候选 + 策略置信度
     */
    List<MountCandidate> execute(ResourceContext ctx, KnowledgeGraphScope scope);
}

/**
 * 策略注册中心 — 新策略只需实现接口并注册
 */
@Component
public class MountStrategyRegistry {
    private final List<MountStrategy> strategies;

    // Spring 自动注入所有 MountStrategy 实现
    public MountStrategyRegistry(List<MountStrategy> strategies) {
        this.strategies = strategies.stream()
                .sorted(Comparator.comparingInt(MountStrategy::getPriority))
                .toList();
    }

    public List<MountStrategy> getApplicableStrategies(ResourceContext ctx) {
        return strategies.stream()
                .filter(s -> s.supports(ctx))
                .toList();
    }
}
```

### 13.2 Provider 切换(已有,增强)

```java
/**
 * AI Provider 接口 — 支持多种LLM切换
 * 已有: OpenAiCompatibleMatchingProvider, KeywordFallbackMatchingProvider
 * 新增: QwenProvider, GLMProvider, LocalModelProvider
 */
public interface AiMatchingProvider {
    List<ResourceMatchResponse> match(ResourceMatchRequest request);
    boolean isAvailable();
    String getProviderName();
    String getModelName();
    int getMaxContextLength();
}
```

### 13.3 向量数据库抽象

```java
/**
 * 向量数据库抽象 — 支持 pgvector / Milvus 切换
 */
public interface VectorDatabase {
    void insert(String id, float[] vector, Map<String, Object> metadata);
    List<VectorSearchResult> search(float[] query, VectorSearchOptions options);
    void delete(String id);
    void update(String id, float[] newVector);
}
```

---

## 十四、后期优化方向

```
┌─────────────────────────────────────────────────────────────────┐
│                     后期优化路线图                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Phase 1 (当前) — 基础挂载                                        │
│  ├── 完善现有 LLM 匹配                                            │
│  ├── 增强 Human-in-the-loop                                       │
│  └── 扩展 knowledge_point 为层级结构                              │
│                                                                   │
│  Phase 2 (近期) — 向量化 + RAG                                    │
│  ├── 部署 Embedding 服务                                          │
│  ├── 引入 pgvector                                                │
│  ├── 实现 RAG 挂载                                                │
│  └── 多路召回 + Reranker                                          │
│                                                                   │
│  Phase 3 (中期) — 多Agent + 知识图谱                              │
│  ├── 实现 Agent 编排器                                            │
│  ├── 构建教育知识图谱 (MySQL + Neo4j)                              │
│  ├── 引入 Elasticsearch 全文检索                                   │
│  └── 反馈闭环训练                                                 │
│                                                                   │
│  Phase 4 (远期) — 智能教学推荐                                     │
│  ├── 基于挂载关系的资源推荐                                        │
│  ├── 学习路径感知的个性化挂载                                      │
│  ├── 跨课程知识关联                                               │
│  └── 资源质量AI评估                                                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 附录: 实施建议

### 第一步 (最优先,改动最小)
1. 扩展 `knowledge_point` → `knowledge_node` (V15),支持层级结构
2. 扩展 `mapping_record` (V16),支持多层级挂载
3. 新增 `resource_content` 表 (V18),存储解析后的文本
4. 新增 `ai_mount_task` 表 (V22),任务追踪
5. 新增 `mount_review_record` 表 (V23),审核记录

### 第二步
6. 部署 Embedding 服务 (Python Sidecar)
7. 新增 `resource_chunk` (V19) + `resource_embedding` (V20, pgvector)
8. 新增 `resource_mount_relation` (V21)
9. 实现向量检索 + RAG挂载流程

### 第三步
10. 实现多策略融合引擎
11. 实现 Agent 编排器
12. 完善 Human-in-the-loop 审核流

### 第四步
13. 引入 Elasticsearch 全文检索
14. 知识图谱 (Neo4j, 可选)
15. 学习路径感知推荐
