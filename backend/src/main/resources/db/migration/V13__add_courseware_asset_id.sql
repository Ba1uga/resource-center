-- V13: 课件表增加 asset_id 字段，关联资源资产表
ALTER TABLE courseware ADD COLUMN asset_id BIGINT NULL COMMENT '关联资源资产ID' AFTER uploaded_at;
