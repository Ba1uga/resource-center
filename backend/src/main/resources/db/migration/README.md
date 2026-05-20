# 数据库迁移脚本目录

将数据库表结构迁移脚本放在这里。

推荐命名规范：

- `V1__init_schema.sql`
- `V2__add_question_tables.sql`
- `V3__add_outline_version_content.sql`

如果后续引入 Flyway，这个目录可以直接复用。
