-- V9: 教材表增加 asset_id 字段，关联资源资产表
ALTER TABLE textbook
    ADD COLUMN asset_id BIGINT NULL COMMENT '关联资源资产ID' AFTER owner_id;

CREATE INDEX idx_textbook_asset_id ON textbook (asset_id);
