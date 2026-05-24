ALTER TABLE outline_version
    ADD COLUMN completion_percent INT NOT NULL DEFAULT 0 COMMENT '完整度百分比' AFTER sections,
    ADD COLUMN completion_issue_count INT NOT NULL DEFAULT 0 COMMENT '未满足导出要求的问题数' AFTER completion_percent,
    ADD COLUMN completion_state VARCHAR(32) NOT NULL DEFAULT 'needs-completion' COMMENT 'needs-completion | nearly-complete | complete' AFTER completion_issue_count;

CREATE INDEX idx_outline_version_course_updated
    ON outline_version (course_id, deleted, updated_at);

CREATE INDEX idx_outline_version_query
    ON outline_version (deleted, archive_state, semester, status, completion_state, updated_at);

CREATE INDEX idx_outline_course_updated
    ON outline_course (deleted, updated_at);
