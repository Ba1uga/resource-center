# ADR 0001: Resource Center Layering

## Decision

保留 `app / views / features` 根分层，并在 `features/resource-center` 内继续按子域细化（navigation、dashboard、profile）。

## Context

当前项目仍是单业务域前端应用。直接引入完整 FSD/DDD 会增加目录成本，超出当前收益。

## Consequences

- 页面组合逻辑集中在 `views`，避免页面组件直接承载大块业务数据。
- 业务模型和业务组件下沉到 `features`，降低后续扩展耦合。
- 不引入空目录（如全局 `shared/api/store`）以避免过度设计。
