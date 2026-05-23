-- V10: 视频时长字段默认值从占位 '00:00' 改为空字符串
ALTER TABLE video MODIFY COLUMN duration VARCHAR(10) NOT NULL DEFAULT '' COMMENT '时长';
