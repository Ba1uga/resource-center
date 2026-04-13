# Layer Rules

- `app` 不直接依赖 feature 私有实现细节。
- `views` 优先通过 `@/features/resource-center/index.ts` 使用 feature 能力。
- feature 内部允许同子域内聚，但避免跨子域深度导入。
- `tests` 可以按需深度导入，用于验证内部模块行为。
- 页面状态放 `views`，业务数据与装配逻辑放 `features/*/model`。
