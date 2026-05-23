-- V11: 视频表增加 asset_id 字段，关联资源资产表
ALTER TABLE video ADD COLUMN asset_id BIGINT NULL COMMENT '关联主视频资源资产ID' AFTER publish_status;
