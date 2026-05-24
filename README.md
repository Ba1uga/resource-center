# resource-center（资源中台）

> 基于大模型的个性化资源生成与学习多智能体系统 —— 资源中台子系统

资源中台是 AI 驱动智能学习平台的**核心资源管理枢纽**，负责教学资源的全生命周期管理，并通过多策略 AI 引擎将资源智能挂载到教育知识图谱中，实现"教育资源 → 知识体系节点"的语义映射。

---

## 目录

- [1. 项目介绍](#1-项目介绍)
- [2. 系统架构](#2-系统架构)
- [3. 技术栈](#3-技术栈)
- [4. 项目结构](#4-项目结构)
- [5. 环境要求](#5-环境要求)
- [6. 快速开始](#6-快速开始)
- [7. 中间件启动](#7-中间件启动)
- [8. 数据库初始化](#8-数据库初始化)
- [9. 项目启动](#9-项目启动)
- [10. API 文档](#10-api-文档)
- [11. AI 功能说明](#11-ai-功能说明)
- [12. 开发规范](#12-开发规范)
- [13. 常见问题](#13-常见问题)
- [14. 后续规划](#14-后续规划)

---

## 1. 项目介绍

### 1.1 项目定位

资源中台是整个《基于大模型的个性化资源生成与学习多智能体系统》的**资源管理子系统**，向上对接 AI 教学智能体，向下管理各类教学资源的存储、解析、向量化和语义挂载。

### 1.2 核心职责

| 职责 | 说明 |
|---|---|
| 教材管理 | 教材元数据 CRUD、版本管理、资产关联 |
| 课件管理 | PPT/PDF/DOC 课件上传、解析、全文检索 |
| 视频管理 | 视频资源元数据、处理状态、发布管理 |
| 题库管理 | 选择题/填空题/简答题/编程题全类型管理 |
| 大纲管理 | 课程大纲版本管理、完成度追踪、归档 |
| 资源解析 | PDF/Word/PPT/Markdown 自动解析提取全文 |
| 智能分块 | 语义分块、固定大小分块、题目分块 |
| 向量化 | BGE-large-zh-v1.5 中文嵌入（1024维） |
| AI 资源挂载 | 多策略融合引擎，将资源自动挂载到知识图谱节点 |
| 人工审核 | 挂载结果审核、修正、反馈收集 |

### 1.3 AI 能力总览

- **多策略挂载引擎**：规则引擎 + 向量语义匹配 + LLM 推理 + 关键词匹配，四种策略加权融合
- **RAG 检索增强**：基于 pgvector 的知识点语义检索，为 LLM 提供候选知识点上下文
- **文档智能解析**：支持 PDF、Word (.docx)、PPT (.pptx)、Markdown 四种格式的自动解析
- **语义分块**：按段落检测内容类型（定义/示例/练习/总结），生成结构化 Chunk
- **反馈闭环**：人工审核结果导出 JSONL，支持后续模型微调

---

## 2. 系统架构

### 2.1 整体架构

```
┌──────────────────────────────────────────────────────────────┐
│                    resource-center (Monorepo)                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────┐  │
│  │  Vue 3 Frontend │  │  Spring Boot     │  │  Embedding │  │
│  │  (Port 5175)    │  │  Backend (8080)  │  │  Service   │  │
│  │                 │  │                  │  │  (8000)    │  │
│  │  TypeScript     │  │  Java 17         │  │  Python    │  │
│  │  Vite 8         │  │  MyBatis-Plus    │  │  FastAPI   │  │
│  │  Pinia          │  │  Spring Boot 3.5 │  │  BGE-zh    │  │
│  └────────┬────────┘  └───────┬──────────┘  └─────┬──────┘  │
│           │                   │                    │         │
│           │  /api/* proxy     │                    │         │
│           ├──────────────────►│                    │         │
│           │                   │  HTTP /embed       │         │
│           │                   ├───────────────────►│         │
│           │                   │                    │         │
└───────────┼───────────────────┼────────────────────┼─────────┘
            │                   │                    │
            ▼                   ▼                    ▼
     ┌──────────┐      ┌──────────────┐     ┌──────────────┐
     │  Browser │      │  MySQL :3306 │     │ PostgreSQL   │
     │  (User)  │      │  (Business)  │     │ :5432        │
     └──────────┘      └──────────────┘     │ (pgvector)   │
                                            └──────────────┘
```

### 2.2 后端模块架构

```
com.baluga.backend
├── common/                    # 全局共享
│   ├── api/R.java             #   统一响应体
│   └── exception/             #   全局异常处理
├── config/                    # Spring 配置
│   ├── MybatisPlusConfig      #   MyBatis-Plus + 分页
│   ├── PgVectorConfig         #   pgvector 独立数据源
│   └── WebMvcConfig           #   CORS
├── infrastructure/            # 技术基础设施
│   └── integration/
│       ├── ai/                #   AI 匹配提供者（DeepSeek）
│       ├── chunking/          #   文本分块策略
│       ├── embedding/         #   嵌入服务客户端
│       ├── matching/          #   资源收集器
│       └── parsing/           #   文档解析器（PDF/Word/PPT/MD）
└── modules/                   # 业务模块
    ├── textbook/              #   教材管理
    ├── outline/               #   大纲版本管理
    ├── courseware/            #   课件管理
    ├── question/              #   题库管理
    ├── video/                 #   视频管理
    ├── storage/               #   文件上传
    ├── mapping/               #   资源映射（批量 AI 匹配）
    └── mount/                 #   AI 挂载引擎（多策略融合）
        ├── engine/            #     规则/LLM/嵌入/融合引擎
        ├── orchestrator/      #     6 阶段挂载编排器
        ├── rag/               #     RAG 知识点检索器
        ├── task/              #     异步任务管理
        ├── review/            #     人工审核
        └── feedback/          #     反馈收集（JSONL 导出）
```

### 2.3 AI 挂载流水线

```
                     MountOrchestrator
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
     1. 文档解析      2. 语义分块      3. 构建上下文
     (PDF/Word/      (Semantic/       (ResourceContext
      PPT/Markdown)   Fixed/Question)   + KnowledgeGraphScope)
           │               │               │
           └───────────────┼───────────────┘
                           ▼
                    4. 多策略融合
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
      RuleBased       Embedding        LLMReasoning
      (精确规则)      (向量语义)       (DeepSeek推理)
           │               │               │
           └───────────────┼───────────────┘
                           ▼
                    FusionMountEngine
                    (加权融合: R=1.5, E=2.0, L=4.0, K=1.5)
                           │
                           ▼
                    ConfidenceCalculator
                    (4维置信度计算)
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
         score≥0.85   0.4≤score<0.85  score<0.4
         自动挂载       人工审核       丢弃
              │            │
              ▼            ▼
     ResourceMountRelation  MountReviewRecord
                           │
                           ▼
                    FeedbackCollector
                    (JSONL 训练数据导出)
```

### 2.4 RAG 检索架构

```
资源文本
   │
   ▼
EmbeddingService (BGE-large-zh-v1.5, 1024维)
   │
   ▼
pgvector 余弦相似度检索 (<=>)
   │
   ▼
Top-K 相似知识点 (默认 Top-15)
   │
   ▼
LLM 推理上下文 (DeepSeek Chat)
   │
   ▼
挂载决策
```

---

## 3. 技术栈

### 3.1 后端

| 技术 | 版本 | 说明 |
|---|---|---|
| Java | 17 | 编译目标版本 |
| Spring Boot | 3.5.14 | 应用框架 |
| Spring Framework | 6.2.18 | 核心框架 |
| MyBatis-Plus | 3.5.16 | ORM + 分页 + 逻辑删除 |
| MySQL Connector | 9.7.0 | MySQL 驱动 |
| PostgreSQL Driver | 42.7.10 | pgvector 数据源驱动 |
| HikariCP | 6.3.3 | 数据库连接池 |
| Apache POI | 5.3.0 | Word/PPT 文档解析 |
| Apache PDFBox | 3.0.3 | PDF 文档解析 |
| Flexmark | 0.64.8 | Markdown 解析 |
| Apache Tika | 2.9.2 | 文件元数据提取 |
| Lombok | 1.18.46 | 代码简化 |
| Jackson | 2.21.2 | JSON 序列化 |
| Tomcat | 10.1.54 | 嵌入式 Web 容器 |
| JUnit Jupiter | 5.12.2 | 单元测试 |
| Mockito | 5.17.0 | 测试 Mock |

### 3.2 前端

| 技术 | 版本 | 说明 |
|---|---|---|
| Vue | 3.5.31 | UI 框架 |
| TypeScript | 6.0 | 类型系统 |
| Vite | 8.0.3 | 构建工具 |
| Pinia | 3.0.3 | 状态管理 |
| Vue Router | 4.6.3 | 路由管理 |
| Node.js | ≥20.19.0 / ≥22.12.0 | 运行时 |

### 3.3 AI / 嵌入服务

| 技术 | 版本 | 说明 |
|---|---|---|
| Python | 3.10+ | 嵌入服务运行时 |
| FastAPI | ≥0.110.0 | Python Web 框架 |
| sentence-transformers | ≥3.0.0 | 嵌入模型框架 |
| BGE-large-zh-v1.5 | - | 中文嵌入模型（1024维） |
| Uvicorn | ≥0.29.0 | ASGI 服务器 |

### 3.4 数据库与中间件

| 中间件 | 版本要求 | 端口 | 用途 |
|---|---|---|---|
| MySQL | 8.0+ | 3306 | 业务数据主库 |
| PostgreSQL | 15+ (需 pgvector 扩展) | 5432 | 向量嵌入存储与检索 |
| DeepSeek API | - | HTTPS | LLM 推理服务 |

---

## 4. 项目结构

```
resource-center/
├── backend/                          # Spring Boot 后端
│   ├── pom.xml                       #   Maven 配置
│   ├── mvnw / mvnw.cmd               #   Maven Wrapper
│   ├── STRUCTURE.md                  #   后端结构说明
│   └── src/
│       ├── main/java/com/baluga/backend/
│       │   ├── BackendApplication.java    # 启动入口
│       │   ├── common/                    # 全局共享代码
│       │   ├── config/                    # Spring 配置类
│       │   ├── infrastructure/            # 技术基础设施
│       │   │   └── integration/
│       │   │       ├── ai/                #   AI 匹配提供者
│       │   │       ├── chunking/          #   分块策略
│       │   │       ├── embedding/         #   嵌入服务客户端
│       │   │       ├── matching/          #   资源收集器
│       │   │       └── parsing/           #   文档解析器
│       │   └── modules/                   # 业务模块
│       │       ├── textbook/              #   教材管理
│       │       ├── outline/               #   大纲管理
│       │       ├── courseware/            #   课件管理
│       │       ├── question/              #   题库管理
│       │       ├── video/                 #   视频管理
│       │       ├── storage/               #   文件上传
│       │       ├── mapping/               #   批量 AI 映射
│       │       └── mount/                 #   多策略挂载引擎
│       │           ├── engine/            #     挂载策略引擎
│       │           ├── orchestrator/      #     编排器
│       │           ├── rag/               #     RAG 检索
│       │           ├── task/              #     异步任务
│       │           ├── review/            #     人工审核
│       │           └── feedback/          #     反馈收集
│       ├── main/resources/
│       │   ├── application.yml            # 主配置
│       │   ├── application-local.yml      # 本地开发覆盖
│       │   ├── application-dev.yml        # 开发环境
│       │   ├── application-prod.yml       # 生产环境
│       │   ├── mapper/                    # MyBatis XML 映射
│       │   └── db/migration/              # 数据库迁移脚本 (V1-V23)
│       └── test/                          # 测试代码
├── src/                              # Vue 3 前端
│   ├── app/                          #   应用入口 + 路由 + 全局样式
│   ├── api/                          #   API 客户端层
│   ├── views/                        #   页面视图
│   └── features/resource-center/     #   功能模块
│       ├── navigation/               #     侧边栏导航
│       ├── profile/                  #     用户信息
│       └── workbench/                #     工作台
│           ├── textbook/             #       教材工作台
│           ├── outline/              #       大纲工作台
│           ├── courseware/           #       课件工作台
│           ├── video/                #       视频工作台
│           ├── question/             #       题目工作台
│           └── mapping/              #       知识映射工作台
├── embedding-service/                # Python 嵌入服务
│   ├── main.py                       #   FastAPI 应用
│   └── requirements.txt              #   Python 依赖
├── docs/                             # 设计文档
│   ├── resource-mounting-system-design.md
│   ├── requirements/
│   └── superpowers/
├── public/                           # 前端静态资源
├── package.json                      # 前端依赖
├── vite.config.ts                    # Vite 构建配置
└── tsconfig.json                     # TypeScript 配置
```

---

## 5. 环境要求

### 5.1 必需环境

| 环境 | 最低版本 | 说明 |
|---|---|---|
| JDK | 17 | 编译与运行后端 |
| Maven | 3.9+ | 后端构建（Wrapper 已包含） |
| Node.js | 20.19.0 / 22.12.0+ | 前端开发与构建 |
| MySQL | 8.0+ | 业务数据库 |
| PostgreSQL | 15+ (含 pgvector 扩展) | 向量数据库 |
| Python | 3.10+ | 嵌入服务运行 |

### 5.2 可选环境

| 环境 | 说明 |
|---|---|
| DeepSeek API Key | LLM 挂载推理（无 Key 时仅能使用关键词 fallback） |

### 5.3 端口占用

| 服务 | 端口 | 可配置 |
|---|---|---|
| 后端 (Spring Boot) | 8080 | `server.port` |
| 前端 (Vite Dev) | 5175 | `vite.config.ts` |
| 嵌入服务 (FastAPI) | 8000 | `embedding-service/main.py` |
| MySQL | 3306 | `DB_PORT` 环境变量 |
| PostgreSQL | 5432 | `PG_PORT` 环境变量 |

---

## 6. 快速开始

### 6.1 环境变量

启动前配置以下环境变量（不配置则使用默认值）：

```bash
# MySQL
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=resource_center
export DB_USERNAME=root
export DB_PASSWORD=your_mysql_password

# PostgreSQL (pgvector)
export PG_HOST=localhost
export PG_PORT=5432
export PG_DB=resource_center
export PG_USER=postgres
export PG_PASSWORD=your_pg_password

# DeepSeek API (AI 挂载功能需要)
export DEEPSEEK_API_KEY=sk-your-deepseek-api-key

# 嵌入服务地址
export EMBEDDING_URL=http://localhost:8000

# 文件上传目录（可选，默认使用系统临时目录）
export BALUGA_UPLOAD_DIR=/path/to/uploads
```

### 6.2 一键启动（3 个终端）

**终端 1** — 启动嵌入服务：

```bash
cd embedding-service
pip install -r requirements.txt
python main.py
# → http://localhost:8000 (首次启动下载模型约 2GB)
```

**终端 2** — 启动后端：

```bash
cd backend
./mvnw spring-boot:run
# → http://localhost:8080
```

**终端 3** — 启动前端：

```bash
npm install
npm run dev
# → http://localhost:5175
```

前端开发服务器已将 `/api` 代理到 `http://localhost:8080`，无需额外配置。

---

## 7. 中间件启动

### 7.1 MySQL

```bash
# Docker
docker run -d --name mysql \
  -e MYSQL_ROOT_PASSWORD=your_password \
  -e MYSQL_DATABASE=resource_center \
  -p 3306:3306 \
  mysql:8.0

# 或使用本地安装的 MySQL，手动创建数据库：
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS resource_center DEFAULT CHARACTER SET utf8mb4;"
```

### 7.2 PostgreSQL + pgvector

```bash
# 推荐使用 pgvector 官方镜像
docker run -d --name pgvector \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=baluga123 \
  -e POSTGRES_DB=resource_center \
  -p 5432:5432 \
  pgvector/pgvector:pg16

# 或手动安装 pgvector 扩展：
# CREATE EXTENSION IF NOT EXISTS vector;
```

### 7.3 嵌入服务

```bash
cd embedding-service
pip install -r requirements.txt
python main.py
```

首次启动会自动从 HuggingFace 下载 `BAAI/bge-large-zh-v1.5` 模型（约 2GB），请确保网络通畅。

---

## 8. 数据库初始化

### 8.1 执行迁移脚本

数据库迁移脚本位于 `backend/src/main/resources/db/migration/`，按版本号顺序手动执行：

```bash
cd backend/src/main/resources/db/migration

# 按 V1 → V23 顺序执行（注意没有 V20）
for f in V1__*.sql V2__*.sql V3__*.sql V4__*.sql V5__*.sql \
         V6__*.sql V7__*.sql V8__*.sql V9__*.sql V10__*.sql \
         V11__*.sql V12__*.sql V13__*.sql V14__*.sql V15__*.sql \
         V16__*.sql V17__*.sql V18__*.sql V19__*.sql V21__*.sql \
         V22__*.sql V23__*.sql; do
  mysql -u root -p resource_center < "$f"
done
```

或在 MySQL 客户端中逐个执行。

### 8.2 pgvector 初始化

```sql
-- 连接到 PostgreSQL
psql -U postgres -d resource_center

-- 安装 pgvector 扩展
CREATE EXTENSION IF NOT EXISTS vector;

-- 创建资源嵌入表（后端运行时也会自动创建）
CREATE TABLE IF NOT EXISTS resource_embedding (
    id              BIGSERIAL PRIMARY KEY,
    target_type     VARCHAR(32)  NOT NULL,
    target_id       BIGINT       NOT NULL,
    embedding       vector(1024),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resource_embedding_type_id
    ON resource_embedding (target_type, target_id);
```

### 8.3 迁移脚本说明

| 脚本 | 说明 |
|---|---|
| V1-V6 | 核心业务表：textbook, outline, courseware, question, video |
| V7 | 映射基础表：knowledge_point, mapping_batch, mapping_record, mapping_candidate |
| V8-V13 | 资源资产与关联：resource_asset, asset_id 外键 |
| V14 | 种子知识点数据 |
| V15-V17 | 知识图谱层级化 + 映射记录扩展 |
| V18-V19 | 资源全文 + 语义分块 |
| V21-V23 | AI 挂载关系 + 异步任务 + 审核记录 |

---

## 9. 项目启动

### 9.1 IntelliJ IDEA 启动

1. 用 IDEA 打开 `backend/` 目录（作为 Maven 项目）
2. 等待 Maven 依赖下载完成
3. 配置环境变量（见第 6.1 节）→ Run → Edit Configurations → Environment Variables
4. 运行 `BackendApplication.main()`

### 9.2 Maven 命令行启动

```bash
cd backend

# 开发环境（使用 application-local.yml）
./mvnw spring-boot:run -Dspring-boot.run.profiles=local

# 跳过测试启动
./mvnw spring-boot:run -DskipTests
```

### 9.3 前端启动

```bash
npm install
npm run dev        # 开发服务器，端口 5175
npm run build      # 生产构建
npm run preview    # 预览生产构建
```

### 9.4 启动顺序建议

```
1. MySQL          ── 必须最先启动
2. PostgreSQL     ── 向量数据库（不使用 AI 挂载时可跳过）
3. 嵌入服务        ── Python 微服务（不使用向量功能时可跳过）
4. 后端           ── Spring Boot（检查 /actuator/health）
5. 前端           ── Vite 开发服务器
```

### 9.5 启动验证

```bash
# 检查后端健康状态
curl http://localhost:8080/actuator/health

# 检查嵌入服务
curl http://localhost:8000/health

# 检查前端
curl http://localhost:5175
```

---

## 10. API 文档

### 10.1 核心 API 端点

| 模块 | 基础路径 | 说明 |
|---|---|---|
| 教材管理 | `/api/textbooks` | 教材 CRUD、分页查询 |
| 大纲管理 | `/api/outlines` | 课程大纲版本管理 |
| 课件管理 | `/api/coursewares` | 课件资源 CRUD |
| 题库管理 | `/api/questions` | 题目 CRUD、分类筛选 |
| 视频管理 | `/api/videos` | 视频资源管理 |
| 文件上传 | `/api/upload` | 分片上传、断点续传 |
| 批量映射 | `/api/mapping` | AI 批量资源匹配 |
| AI 挂载 | `/api/mount` | 多策略挂载引擎 |
| 挂载审核 | `/api/mount/reviews` | 人工审核挂载结果 |
| 健康检查 | `/actuator/health` | 服务健康状态 |

### 10.2 通用响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### 10.3 当前状态

项目暂未集成 Swagger/Knife4j。API 接口可通过以下方式查看：

- 阅读各模块 `controller/` 目录下的 `@RestController` 类
- 使用 Postman/Insomnia 导入抓取的请求
- 后续计划集成 SpringDoc OpenAPI

---

## 11. AI 功能说明

### 11.1 AI 资源挂载（核心能力）

**目标**: 给定一个教学资源（教材章节、课件、视频、题目、大纲），自动判断它属于知识图谱中的哪个课程、哪个章节、哪个知识点。

**流程**:

```
资源上传 → 文档解析 → 语义分块 → 向量嵌入 → 多策略匹配 → 融合决策 → 自动挂载/人工审核
```

### 11.2 四种挂载策略

#### 策略 1：规则引擎 (RuleBasedMountEngine)

- **优先级**: 1（最先执行）
- **逻辑**:
  - 课程字段直接匹配
  - 中文章节号正则匹配（如"第三章"）
  - 知识点名称在资源内容中的精确出现
- **适用**: 结构良好、有明确课程归属的资源

#### 策略 2：嵌入语义匹配 (EmbeddingMatchEngine)

- **优先级**: 3
- **逻辑**:
  - 将资源的所有 Chunk 通过 BGE-large-zh-v1.5 嵌入为向量
  - 平均池化得到资源整体向量
  - 在 pgvector 中通过余弦距离检索 Top-20 相似知识点
  - 相似度转换为置信度分数
- **适用**: 文本丰富、语义明确的资源
- **前置条件**: Chunk 嵌入已生成 + 知识点嵌入已存在

#### 策略 3：LLM 推理 (LLMReasoningMountEngine)

- **优先级**: 5
- **逻辑**（三阶段流水线）:
  1. **课程分类**: LLM 判断资源属于哪个课程
  2. **章节定位**: LLM 判断资源属于哪个章节/节
  3. **知识点匹配**: RAG 检索 Top-15 知识点 → LLM 从中选择最匹配的
- **模型**: DeepSeek Chat（通过 OpenAI 兼容 API）
- **温度**: 0.1（保证输出一致性）
- **回退**: LLM 调用失败时降级为关键词匹配

#### 策略 4：关键词相似度 (Jaccard)

- **逻辑**: 字符二元组 Jaccard 相似度（资源标题 vs 知识点名称）
- **阈值**: ≥0.5 高置信度, ≥0.2 中置信度
- **适用**: 作为所有其他策略的 fallback

### 11.3 融合引擎 (FusionMountEngine)

四种策略的结果通过加权融合：

| 策略 | 权重 |
|---|---|
| LLM 推理 | 4.0 |
| 嵌入语义 | 2.0 |
| 规则引擎 | 1.5 |
| 关键词 | 1.5 |

融合后的候选人按加权平均分数排序，再通过 `ConfidenceCalculator` 计算最终置信度（4 个维度）：

- 原始融合分数：40%
- 策略一致性（越多策略同意越高）：25%
- 最高置信度标签：15%
- 历史准确率代理：20%

### 11.4 决策分级

| 分数区间 | 决策 | 行为 |
|---|---|---|
| ≥ 0.85 | 自动挂载 | 直接创建 ResourceMountRelation |
| 0.4 ~ 0.85 | 待审核 | 创建 MountReviewRecord，等待人工确认 |
| < 0.4 | 丢弃 | 不挂载 |

### 11.5 RAG 知识点检索

`KnowledgePointRetriever` 组件：
- 将所有知识点 (名称 + 描述) 批量嵌入并存入 pgvector
- 查询时：将资源文本嵌入 → pgvector 余弦搜索 → 返回 Top-K 相似知识点
- 供 LLM 推理作为候选集，将知识点范围从可能的上千个缩小到 15 个

### 11.6 文档解析能力

| 格式 | 解析库 | 提取内容 |
|---|---|---|
| .docx | Apache POI | 段落文本、表格、样式 |
| .pptx | Apache POI | 幻灯片文本、备注 |
| .pdf | Apache PDFBox | 页面文本 |
| .md | Flexmark | Markdown AST → 纯文本 |

### 11.7 反馈闭环

人工审核结果通过 `FeedbackCollector` 导出为 JSONL：

```jsonl
{"type":"approve","resource_title":"...","node_name":"...","ai_confidence":0.92}
{"type":"modify","resource_title":"...","original_node":"...","corrected_node":"...","ai_confidence":0.65}
{"type":"reject","resource_title":"...","node_name":"...","ai_confidence":0.45}
```

该数据可用于后续 LLM 微调，持续提升挂载准确率。

---

## 12. 开发规范

### 12.1 分支规范

| 分支 | 说明 |
|---|---|
| `main` | 生产分支，受保护 |
| `dev` | 开发主分支，日常开发合并到此 |
| `feature/*` | 功能分支，从 dev 拉出，完成后合并回 dev |
| `fix/*` | 修复分支 |
| `release/*` | 发布分支 |

### 12.2 提交规范

遵循 Conventional Commits：

```
feat: 添加 AI 多策略挂载引擎
fix: 修复 pgvector 余弦距离计算错误
docs: 更新 README 中间件说明
refactor: 重构 ChunkService 抽取公共接口
test: 添加 MountOrchestrator 单元测试
```

### 12.3 后端代码规范

- 包结构遵循 `modules/{业务模块}/{层级}` 模式
- Controller 只做参数接收和校验，不写业务逻辑
- Service 接口 + ServiceImpl 实现，使用构造函数注入
- Mapper 继承 MyBatis-Plus `BaseMapper<T>`，自定义 SQL 写在 XML 中
- DTO 分为 `request/` 和 `response/`，使用 Lombok `@Data`
- Entity 使用 `@TableName` 映射数据库表，启用逻辑删除

### 12.4 前端代码规范

- 按功能模块组织 `features/resource-center/workbench/`
- 每个工作台模块独立管理自己的 API、组件、状态、样式
- 使用 Pinia 进行状态管理
- API 调用统一通过 `src/api/` 下的模块化客户端

---

## 13. 常见问题

### 13.1 端口占用

```bash
# Windows 查看端口占用
netstat -ano | findstr :8080
# 终止进程
taskkill /PID <PID> /F
```

### 13.2 MySQL 连接失败

```
CommunicationsException: Communications link failure
```

- 检查 MySQL 服务是否启动
- 检查 `DB_HOST`、`DB_PORT` 环境变量是否正确
- 检查数据库 `resource_center` 是否已创建
- 检查 `application.yml` 中的用户名密码

### 13.3 PostgreSQL / pgvector 连接失败

- 确认 PostgreSQL 已安装 pgvector 扩展：`SELECT * FROM pg_extension WHERE extname='vector';`
- 如未安装：`CREATE EXTENSION vector;`
- 确认 `PG_HOST`、`PG_PORT`、`PG_PASSWORD` 配置正确
- **不使用 AI 向量功能时，此错误不影响基本 CRUD 操作**

### 13.4 嵌入服务启动失败

```
OSError: [WinError 1455] 页面文件太小，无法完成操作
```

- Windows 下加载 2GB 模型需要足够的虚拟内存
- 解决：增加 Windows 页面文件大小（系统属性 → 高级 → 性能 → 虚拟内存）
- 或降低模型规模换用 `bge-small-zh-v1.5`

### 13.5 AI 挂载返回空结果

- 确认 `DEEPSEEK_API_KEY` 已正确配置
- 确认 DeepSeek API 余额充足
- 关键词 fallback 不需要 API Key，但准确率较低
- 确认 `baluga.ai.matching.openai-base-url` 指向正确的 API 地址

### 13.6 前端 Vite 代理不生效

- 确认 `vite.config.ts` 中 proxy 配置指向 `http://localhost:8080`
- 确认后端已启动并监听 8080 端口
- 前端 API 调用路径必须以 `/api` 开头才能触发代理

### 13.7 文件上传 500 错误

- 检查 `BALUGA_UPLOAD_DIR` 目录是否存在且有写入权限
- 默认使用系统临时目录，确认磁盘空间充足
- 文件大小上限 500MB，检查是否超出

---

## 14. 后续规划

| 规划项 | 说明 |
|---|---|
| SpringDoc OpenAPI | 集成 Swagger/Knife4j 自动生成 API 文档 |
| Flyway 集成 | 自动化数据库迁移，替代手动执行 SQL |
| Docker Compose | 一键启动所有中间件和服务 |
| Redis 缓存 | 热点知识点缓存、会话管理 |
| Elasticsearch | 资源全文检索、混合搜索 |
| MinIO / OSS | 对象存储替代本地文件存储 |
| 多 Agent 架构 | 将挂载流水线升级为多 Agent 协作模式 |
| 教育知识图谱 | 完整的三层知识体系（课程→章→节→知识点→能力目标） |
| 自动知识抽取 | 从教材/课件中自动抽取新知识点 |
| LLM 微调 | 基于 FeedbackCollector 收集的 JSONL 数据微调挂载模型 |
| AI Tutor 联动 | 挂载结果驱动个性化学习路径推荐 |
| 视频 OCR/转录 | 视频内容自动提取与标注 |
| Sa-Token 认证 | 统一身份认证与权限管理 |
| Nacos 配置中心 | 动态配置管理与服务发现 |

---

## 附录

### A. 系统设计文档

- [资源挂载系统架构设计](docs/resource-mounting-system-design.md)
- [AI 资源知识挂载架构](docs/requirements/2026-05-19-ai-resource-knowledge-mounting-architecture.md)
- [AI 自动映射需求澄清](docs/requirements/2026-05-12-clarify-requirement-ai-auto-mapping-...)

### B. 后端模块设计

- [后端目录结构说明](backend/STRUCTURE.md)

### C. 技术参考

- [BGE-large-zh-v1.5 模型](https://huggingface.co/BAAI/bge-large-zh-v1.5) — 中文嵌入模型
- [pgvector](https://github.com/pgvector/pgvector) — PostgreSQL 向量扩展
- [DeepSeek API](https://platform.deepseek.com/api-docs) — LLM 推理服务
- [MyBatis-Plus](https://baomidou.com/) — 增强版 MyBatis
