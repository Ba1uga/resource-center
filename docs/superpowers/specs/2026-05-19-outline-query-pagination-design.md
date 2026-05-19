# 大纲查询分页与按需加载设计

日期：2026-05-19

## 背景

当前大纲工作台采用“整棵课程树一次性返回”的查询方式：

- 后端 `GET /api/outline/courses` 直接返回课程及其全部版本。
- 前端一次性拉取全部课程和全部版本，再在本地完成筛选、排序和树形渲染。
- 版本完整度依赖前端基于 `sections` JSON 即时计算。

这种模式在数据量较小时实现简单，但随着课程数和版本数增长，会同时带来四类问题：

1. 数据库层面需要全量扫描课程和版本。
2. 接口层面响应体持续膨胀，列表查询携带大量不必要的 `sections` JSON。
3. 前端层面内存占用、筛选成本和渲染成本同步升高。
4. 交互层面左侧树的展开、筛选、翻页都缺少可扩展的数据边界。

本次设计目标是在不推翻现有大纲工作台核心使用方式的前提下，完成查询模式升级：

- 课程改为分页查询。
- 课程下版本改为按需加载。
- 右侧版本详情继续按单版本加载。
- 保留全局搜索、全局完整度筛选和当前工作台的未保存拦截体验。

## 设计目标

### 目标

1. 将大纲查询从“整树全量加载”改为“课程分页摘要 + 版本按需加载 + 版本详情单独查询”。
2. 保留全局搜索能力，支持跨课程标题、教师、版本名称、备注等字段命中。
3. 保留全局完整度筛选能力，而不是退化为仅对已加载版本生效。
4. 保留现有工作台的核心操作心智：左侧课程树，右侧版本编辑，未保存切换拦截。
5. 沿用仓库现有分页实现风格，优先复用教材模块和 `WorkbenchTablePagination` 的既有模式。

### 非目标

1. 本次不重做右侧版本编辑器结构，不改动当前分段编辑和打印导出模式。
2. 本次不引入新的视觉语言，仍沿用当前资源中台的浅色工作台和面板式布局。
3. 本次不做跨页批量选择、跨页批量操作或高级统计报表。
4. 本次不将大纲模块改造成“以版本为主表”的全新工作台形态。

## 当前实现问题

### 后端问题

当前 [OutlineServiceImpl](D:/AAA_Mine/AAA-MyWorkSpace/Vue3/resource-center/backend/src/main/java/com/baluga/backend/modules/outline/service/impl/OutlineServiceImpl.java) 的 `listCoursesWithVersions` 采用如下流程：

1. 先按课程字段查出所有命中课程。
2. 再按课程 ID 集合查出这些课程下的全部命中版本。
3. 在内存中按课程分组，再组装为树形返回。

该流程的问题在于：

- 分页能力缺失。
- 列表查询与详情查询共用同一套重型数据结构。
- `sections` 解析和完整度计算不适合继续绑定在列表场景中。

### 前端问题

当前 [outline.ts](D:/AAA_Mine/AAA-MyWorkSpace/Vue3/resource-center/src/api/outline.ts) 与 [OutlineWorkbenchSection.vue](D:/AAA_Mine/AAA-MyWorkSpace/Vue3/resource-center/src/features/resource-center/workbench/outline/ui/OutlineWorkbenchSection.vue) 默认将整包课程树拉到本地，之后再通过 view-model 做：

- 搜索
- 学期筛选
- 版本状态筛选
- 完整度筛选
- 归档状态筛选
- 排序

这意味着随着数据增长，前端本地筛选和左树渲染都会持续放大。

### 完整度问题

当前完整度规则位于 [outline-workbench.validation.ts](D:/AAA_Mine/AAA-MyWorkSpace/Vue3/resource-center/src/features/resource-center/workbench/outline/model/outline-workbench.validation.ts)，它是右侧编辑态校验的合理实现，但不适合作为全局列表筛选的实时计算基础。列表筛选如果继续依赖 `sections` JSON 逐条解析，会在数据库、后端和前端三层同时放大成本。

## 方案比较

### 方案一：课程分页摘要 + 版本按需加载 + 版本详情单独查询

这是推荐方案。

核心思路：

- 课程列表返回分页摘要。
- 课程展开时再按需拉取该课程的版本摘要列表。
- 点击版本时继续按单版本拉取详情。

优点：

- 最符合当前“大纲课程树 + 右侧工作区”的使用心智。
- 可以直接复用仓库已有分页组件与分页接口模式。
- 能清晰拆分列表摘要和详情数据，避免 `sections` 进入列表查询。

缺点：

- 需要新增摘要 DTO、懒加载状态和课程级版本缓存。
- 需要对完整度做后端可检索摘要化。

### 方案二：按版本全局分页，再按课程分组展示

核心思路：

- 后端直接对版本结果集做全局分页。
- 前端将当前页结果按课程分组显示为伪树结构。

优点：

- 全局搜索和全局完整度筛选天然简单。
- 后端 SQL 设计更直接。

缺点：

- 会弱化课程作为一级对象的工作台心智。
- 与当前“课程树展开版本”的交互形态不一致。

### 方案三：继续返回整棵树，但仅做数据库级聚合和缓存优化

核心思路：

- 保持接口形态不变。
- 在后端增加聚合、缓存和更强的 SQL。

优点：

- 前端改动最小。

缺点：

- 仍然无法从根本上解决列表接口过重的问题。
- 查询规模继续增长后，最终仍会走向摘要接口与按需明细拆分。

## 推荐方案

推荐采用方案一：`课程分页摘要 + 版本按需加载 + 版本详情单独查询`。

这是与当前仓库最一致、也最容易稳定扩展的做法。推荐方案的核心原则如下：

1. 列表查询不再返回 `sections`。
2. 列表筛选使用结构化摘要字段，不依赖前端即时校验。
3. 左侧树只负责课程与版本摘要导航。
4. 右侧工作区只负责当前单个版本详情的查看、编辑、保存和导出。

## 总体架构

推荐将大纲模块数据边界拆为三层：

1. 课程分页摘要层
2. 版本摘要层
3. 版本详情层

对应的调用关系：

1. 页面初始化或筛选变化时，先查询课程分页摘要。
2. 用户展开课程时，再查询该课程的版本摘要页。
3. 用户选择某个版本时，再查询该版本的详情。

这样可以保证：

- 页面打开时的数据量稳定。
- 列表筛选成本稳定。
- 右侧编辑区仍保留完整版本编辑能力。

## 接口设计

### 1. 课程分页查询

将现有：

- `GET /api/outline/courses -> R<List<OutlineCourseVO>>`

改为：

- `GET /api/outline/courses -> R<Page<OutlineCourseSummaryVO>>`

请求参数建议扩展 [OutlineListRequest.java](D:/AAA_Mine/AAA-MyWorkSpace/Vue3/resource-center/backend/src/main/java/com/baluga/backend/modules/outline/dto/request/OutlineListRequest.java)：

```java
private String keyword;
private String semester;
private String versionStatus;
private String completionState;
private String archiveState = "active";
private Integer page = 1;
private Integer pageSize = 10;
```

`OutlineCourseSummaryVO` 建议字段：

```java
private Long id;
private String title;
private String instructor;
private String department;
private Integer matchedVersionCount;
private Integer totalVersionCount;
private LocalDateTime latestMatchedVersionUpdatedAt;
```

说明：

- `matchedVersionCount` 表示当前筛选条件下命中的版本数量。
- `totalVersionCount` 表示课程所有版本数量。
- `latestMatchedVersionUpdatedAt` 用于课程列表排序与信息提示。
- 课程是否已加载过版本摘要属于前端运行态，不进入后端 DTO。

### 2. 课程下版本摘要按需查询

新增接口：

- `GET /api/outline/courses/{courseId}/versions -> R<Page<OutlineVersionSummaryVO>>`

该接口接收与课程页一致的版本维度筛选条件：

- `keyword`
- `semester`
- `versionStatus`
- `completionState`
- `archiveState`
- `page`
- `pageSize`

`OutlineVersionSummaryVO` 建议字段：

```java
private Long id;
private Long courseId;
private String versionName;
private String semester;
private String status;
private String archiveState;
private LocalDateTime archivedAt;
private String note;
private String updatedBy;
private LocalDateTime updatedAt;
private Integer completionPercent;
private Integer completionIssueCount;
private String completionState;
```

说明：

- 左树渲染需要的只是摘要字段，不需要 `sections`。
- 版本摘要接口必须支持分页，否则单课程版本过多时左树仍会膨胀。

### 3. 单版本详情查询

保留现有：

- `GET /api/outline/versions/{id}`

该接口继续返回完整版本详情，用于右侧工作区的编辑、校验和导出。

### 4. 写接口

以下接口路由保持不变：

- `POST /api/outline/courses`
- `POST /api/outline/versions`
- `POST /api/outline/versions/duplicate`
- `PUT /api/outline/versions/{id}`
- `PUT /api/outline/versions/{id}/archive`
- `PUT /api/outline/versions/{id}/restore`

但其内部逻辑需要在写库后同步更新版本摘要字段。

## 数据模型与持久化设计

### 1. 版本摘要字段

建议对 `outline_version` 增加以下字段：

```sql
ALTER TABLE outline_version
    ADD COLUMN completion_percent INT NOT NULL DEFAULT 0 COMMENT '完整度百分比',
    ADD COLUMN completion_issue_count INT NOT NULL DEFAULT 0 COMMENT '未满足导出要求的问题数',
    ADD COLUMN completion_state VARCHAR(32) NOT NULL DEFAULT 'needs-completion' COMMENT 'needs-completion | nearly-complete | complete';
```

### 2. 完整度状态映射

完整度规则与前端当前规则保持一致：

- `complete`: 问题数为 0
- `needs-completion`: 完整度百分比小于 80
- `nearly-complete`: 完整度百分比大于等于 80 且仍存在问题

这里的“问题数”建议与当前导出校验中的 `issues.length` 对齐，而不是单独再定义一套轻量规则。

### 3. 完整度计算唯一真源

建议在后端新增统一的完整度计算能力，例如：

- `OutlineCompletionSummaryCalculator`

职责：

1. 接收版本 `sections`
2. 生成 `completionPercent`
3. 生成 `completionIssueCount`
4. 生成 `completionState`

这样可以保证：

- 右侧编辑态的即时校验逻辑有稳定参照
- 列表摘要字段的计算逻辑不分叉
- 历史数据回填、保存、复制、创建时使用同一套计算规则

### 4. 历史数据回填

历史数据不建议仅依赖 SQL JSON 函数直接回填完整度，因为这会复制一套规则并增加前后端漂移风险。

推荐做法：

1. 数据库迁移先增加字段。
2. 应用层提供一次性批量回填逻辑。
3. 回填完成后，后续所有写路径通过统一计算器保持摘要字段实时更新。

## 查询规则设计

### 1. 全局关键词搜索

关键词保留全局能力，课程命中规则建议为：

- 课程字段命中：`title / instructor / department`
- 或存在版本字段命中：`version_name / note / updated_by`

即：

- 课程被纳入结果集的条件是“课程自身命中”或“至少存在一个版本命中”。

### 2. 全局完整度筛选

完整度筛选必须作用于后端摘要字段，而不是前端已加载列表。

课程进入结果集的前提为：

- 至少存在一个满足完整度条件的版本
- 或在未启用版本维度筛选时，该课程本身满足零版本课程展示规则

### 3. 零版本课程规则

零版本课程必须继续保留，但规则需要显式化：

- 当未启用版本维度筛选时，零版本课程允许依靠课程字段命中进入结果集。
- 一旦启用了以下任一筛选：
  - `semester`
  - `versionStatus`
  - `completionState`
  - `archiveState`

  零版本课程应自然退出结果集。

### 4. 课程分页查询策略

课程分页不能继续走“查出所有课程，再内存过滤版本”的方式。推荐采用两阶段查询：

1. 先按版本筛选条件得到命中课程集合与命中版本统计。
2. 再对课程摘要结果做分页、排序和返回。

这样才能保证：

- 课程分页是真分页
- 全局搜索和全局完整度筛选是真全局
- JVM 内存不会随着数据量线性膨胀

### 5. 版本按需查询策略

课程展开时默认拉取该课程的第 1 页版本摘要，例如 20 条/页。若单课程版本很多，再提供课程内的“小分页”或“查看更多版本”能力，而不是一次性把所有版本塞回左树。

## 排序设计

当前课程查询按 `OutlineCourse.id asc` 排序，不适合分页后的工作台体验。

建议课程列表改为最近活跃优先，优先级如下：

1. `latestMatchedVersionUpdatedAt desc`
2. `course.updatedAt desc`
3. `course.id desc`

这样可以保证：

- 新建课程更容易落在前页
- 最近编辑版本的课程更符合运营工作台使用习惯

版本摘要列表建议仍按：

1. `updatedAt desc`
2. `id desc`

排序。

## 索引建议

建议至少增加以下索引：

```sql
CREATE INDEX idx_outline_version_course_updated
    ON outline_version (course_id, deleted, updated_at DESC);

CREATE INDEX idx_outline_version_query
    ON outline_version (deleted, archive_state, semester, status, completion_state, updated_at DESC);

CREATE INDEX idx_outline_course_updated
    ON outline_course (deleted, updated_at DESC);
```

说明：

- 结构化筛选优先由索引承担。
- 关键词 `LIKE` 查询无法完全由普通索引解决，但应尽量先缩小候选集。

## 前端交互设计

### 1. 查询栏

保留现有查询栏结构：

- 搜索框
- 学期筛选
- 版本状态筛选
- 完整度筛选
- 归档状态筛选
- 重置按钮
- 新建版本按钮

变化点：

- 查询条件全部改为服务端筛选条件。
- 任一筛选变化时，课程页码重置为第 1 页。
- 搜索框建议增加短防抖，避免每个字符都触发一次课程分页查询。

### 2. 左侧课程树

左侧区域改为：

1. 课程创建按钮
2. 当前页课程摘要列表
3. 左树底部分页区

分页组件直接复用 [WorkbenchTablePagination.vue](D:/AAA_Mine/AAA-MyWorkSpace/Vue3/resource-center/src/features/resource-center/workbench/shared/ui/WorkbenchTablePagination.vue)。

### 3. 课程展开

点击课程头部时：

1. 若该课程版本摘要尚未加载，则显示加载态并发起版本摘要请求。
2. 请求成功后显示该课程的版本列表。
3. 请求失败时仅在该课程区域展示“加载失败，可重试”，不将整页置为离线。

### 4. 版本选择

点击版本时：

1. 若当前有未保存修改，则仍沿用 `pendingSelection` 拦截逻辑。
2. 若允许切换，则拉取版本详情。
3. 详情加载完成后更新右侧工作区。

### 5. 右侧工作区保持策略

右侧工作区只绑定“当前单个版本详情”。

在以下场景中，右侧已打开版本不应被强制清空：

- 左侧课程翻页
- 左侧课程收起
- 版本摘要懒加载失败
- 当前筛选条件导致该版本不在当前页结果中

若当前版本不在当前页或不在当前筛选结果中，应显示明确提示，但仍允许继续编辑或保存。

### 6. 新建课程与新建版本

新建课程后：

- 返回课程分页第一页
- 默认选中新建课程
- 若当前排序为最近活跃优先，则新建课程应可见

新建版本、复制版本后：

- 更新当前课程版本摘要
- 更新右侧详情选中态
- 不必整页全量刷新

### 7. 归档与恢复

归档或恢复后：

- 刷新当前课程版本摘要
- 若当前筛选导致版本移出列表，则右侧继续保留当前详情
- 用状态提示告知用户“版本已归档但当前不在筛选结果中”或“版本已恢复”

## 错误处理设计

### 1. 课程分页失败

课程分页失败时：

- 左侧课程区进入错误态
- 可继续沿用当前“连接异常 / 本地样例”兜底思路
- 右侧已打开版本详情不应被清空

### 2. 课程版本懒加载失败

课程版本懒加载失败时：

- 仅影响该课程展开区
- 提供明确的局部重试入口
- 不应污染整个页面的连接状态

### 3. 版本详情加载失败

版本详情加载失败时：

- 保持左侧选中状态
- 右侧显示错误态或保留上一版本详情并给出错误反馈
- 不直接清空未保存草稿

### 4. 未保存切换拦截

未保存拦截只作用于“切换版本”动作，不应扩散到：

- 左侧课程翻页
- 课程展开或收起
- 版本摘要加载

否则浏览列表时会被过度打断。

## 测试设计

### 1. 后端测试

扩展现有 [OutlineControllerTest.java](D:/AAA_Mine/AAA-MyWorkSpace/Vue3/resource-center/backend/src/test/java/com/baluga/backend/modules/outline/controller/OutlineControllerTest.java)，至少覆盖：

- 课程分页参数透传
- 课程分页空结果
- 课程不存在时的版本摘要查询
- 非法页码和默认页码行为
- 版本详情不存在时的 404

服务层测试建议覆盖：

- 全局关键词命中课程字段
- 全局关键词命中版本字段
- 完整度筛选
- 零版本课程在不同筛选下的进入与退出规则

### 2. 前端 API 测试

扩展现有 [outline.test.ts](D:/AAA_Mine/AAA-MyWorkSpace/Vue3/resource-center/tests/resource-center/api/outline.test.ts)，至少覆盖：

- 课程分页接口 query 参数
- 版本摘要接口 query 参数
- 详情接口继续返回单版本完整数据

### 3. 前端工作台测试

扩展 `tests/resource-center/workbench/outline/*`，至少覆盖：

1. 课程翻页后右侧当前版本仍保留
2. 有未保存修改时切换版本仍触发拦截
3. 筛选变化时课程页码重置到第 1 页
4. 当前版本不在当前页列表中时仍可编辑
5. 课程懒加载失败仅影响局部区域

## 预期改动范围

后端预期涉及：

- `backend/src/main/java/com/baluga/backend/modules/outline/controller/OutlineController.java`
- `backend/src/main/java/com/baluga/backend/modules/outline/service/OutlineService.java`
- `backend/src/main/java/com/baluga/backend/modules/outline/service/impl/OutlineServiceImpl.java`
- `backend/src/main/java/com/baluga/backend/modules/outline/entity/OutlineVersion.java`
- `backend/src/main/java/com/baluga/backend/modules/outline/dto/request/OutlineListRequest.java`
- `backend/src/main/java/com/baluga/backend/modules/outline/dto/response/*`
- `backend/src/main/resources/db/migration/*`
- 大纲模块对应 mapper / XML 或自定义查询实现

前端预期涉及：

- `src/api/outline.ts`
- `src/features/resource-center/workbench/outline/ui/OutlineWorkbenchSection.vue`
- `src/features/resource-center/workbench/outline/model/outline-workbench.types.ts`
- `src/features/resource-center/workbench/outline/model/outline-workbench.view-model.ts`
- 必要的课程版本懒加载状态管理
- 相关测试文件

## 落地顺序

推荐按以下顺序实施，不建议并行打散：

1. 数据库字段与实体模型补齐。
2. 后端课程分页摘要接口与课程版本摘要接口落地。
3. 前端 `src/api/outline.ts` 数据模型拆分为课程摘要、版本摘要、版本详情。
4. 左侧课程树改造成分页 + 按需加载。
5. 回收右侧状态流、错误态与回归测试。

## 验收标准

实施完成后，应满足以下结果：

1. 页面首次加载不再一次返回全部课程和全部版本。
2. 左侧课程区存在真实分页能力。
3. 课程展开时版本按需加载，不返回 `sections`。
4. 点击版本后仍可进入完整编辑态。
5. 全局搜索、全局完整度筛选、归档筛选依然成立。
6. 未保存切换拦截、右侧工作区保持、归档恢复状态提示均继续可用。
7. 新增的测试覆盖新的接口边界和关键交互路径。
