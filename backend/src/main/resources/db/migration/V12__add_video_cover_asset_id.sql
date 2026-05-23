-- V12: 视频表增加 cover_asset_id 字段，关联封面资源资产
ALTER TABLE video ADD COLUMN cover_asset_id BIGINT NULL COMMENT '关联封面资源资产ID' AFTER asset_id;
