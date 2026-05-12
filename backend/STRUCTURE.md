# 后端目录结构说明

## 目标

当前后端采用 `单体 Spring Boot 应用 + 按业务模块分包` 的目录结构。
这样做的目的是让后端代码与当前前端模块保持一致，避免全局平铺的
`controller/service/mapper/entity` 结构在业务增多后变得难以维护。

## 顶层结构

```text
backend
├─ src/main/java/com/baluga/backend
│  ├─ common
│  ├─ config
│  ├─ infrastructure
│  └─ modules
├─ src/main/resources
│  ├─ mapper
│  ├─ db/migration
│  └─ application-*.yml
└─ src/test/java/com/baluga/backend
   ├─ common
   └─ modules
```

## 目录职责

### `src/main/java/com/baluga/backend`

- `common`：全局共享代码，只放真正跨模块复用的能力，例如统一返回体、异常、枚举、常量和工具类。
- `config`：Spring Boot 配置类，例如 MyBatis-Plus、Jackson、CORS、MVC 等配置。
- `infrastructure`：技术基础设施代码，为系统提供支撑，但不直接归属于某个业务模块。
- `modules`：面向业务的模块集合。每个模块都维护自己的 `controller`、`service`、`mapper`、`entity`、`dto`、`convert` 目录。

### `src/main/java/com/baluga/backend/common`

- `api`：统一 API 返回模型、分页对象和接口传输约定。
- `exception`：业务异常和全局异常处理。
- `enums`：多个模块共用的枚举定义。
- `constants`：可复用的常量定义。
- `util`：不归属单一业务模块的工具类。

### `src/main/java/com/baluga/backend/infrastructure`

- `mybatis`：MyBatis-Plus 支撑代码，例如自动填充处理器、类型处理器等。
- `storage`：文件存储、对象存储、本地存储适配和上传相关基础能力。
- `integration`：外部系统适配层，例如 OSS、短信、工作流或第三方 API 集成。

### `src/main/java/com/baluga/backend/modules`

- `course`：课程主数据模块，包含课程、章节和知识点。
- `outline`：课程大纲版本管理模块。
- `question`：题库管理模块。
- `courseware`：课件资源管理模块。
- `video`：视频资源管理模块。
- `mapping`：资源与知识点挂载模块。
- `auth`：认证与权限相关模块。

每个业务模块统一遵循以下内部结构：

- `controller`：HTTP 入口层，负责接收请求、参数校验和返回统一响应。
- `service`：业务服务接口定义。
- `service/impl`：业务服务实现与事务编排。
- `mapper`：MyBatis-Plus Mapper 接口和自定义 SQL 入口。
- `entity`：持久化实体，与数据库表结构映射。
- `dto/request`：请求 DTO。
- `dto/response`：响应 DTO。
- `convert`：DTO、实体、领域对象之间的转换辅助类。

### `src/main/resources`

- `application.yml`：公共基础配置。
- `application-local.yml`：本地开发环境覆盖配置。
- `application-dev.yml`：开发环境配置。
- `application-prod.yml`：生产环境配置。
- `mapper`：按模块划分的 XML SQL 文件。
- `db/migration`：数据库迁移脚本目录，例如 Flyway 脚本或手工维护的基线 SQL。

### `src/main/resources/mapper`

- `course`：课程、章节、知识点相关 SQL XML。
- `outline`：大纲版本与大纲内容相关 SQL XML。
- `question`：题库与题目内容相关 SQL XML。
- `courseware`：课件资源相关 SQL XML。
- `video`：视频资源相关 SQL XML。
- `mapping`：资源挂载相关 SQL XML。

### `src/test/java/com/baluga/backend`

- `common`：通用组件测试，例如统一返回体、工具类、异常处理等。
- `modules/course`：课程模块测试。
- `modules/outline`：大纲模块测试。
- `modules/question`：题库模块测试。
- `modules/courseware`：课件模块测试。
- `modules/video`：视频模块测试。
- `modules/mapping`：挂载模块测试。
- `modules/auth`：认证与权限模块测试。

## 占位文件说明

大部分空包会保留 `package-info.java` 或 `README.md` 作为占位文件，
这样目录可以被 Git 跟踪，同时也能作为该目录职责的第一层说明。
