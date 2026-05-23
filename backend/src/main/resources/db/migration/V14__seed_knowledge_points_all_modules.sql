-- V14: 从教材和课件模块补充知识点种子数据（按 course+chapter+name 去重）
INSERT IGNORE INTO knowledge_point (name, course, chapter, description, source_type, source_id, created_at, updated_at)
SELECT t.name, t.course, '', CONCAT('教材: ', t.name, ' / ', t.author, ' / ', t.publisher),
       'manual', t.id, NOW(), NOW()
FROM textbook t
WHERE t.deleted = 0
  AND t.name IS NOT NULL AND t.name != ''
ON DUPLICATE KEY UPDATE updated_at = NOW();

INSERT IGNORE INTO knowledge_point (name, course, chapter, description, source_type, source_id, created_at, updated_at)
SELECT c.title, c.course, c.chapter, CONCAT('课件: ', c.title, ' (', c.type, ')'),
       'manual', c.id, NOW(), NOW()
FROM courseware c
WHERE c.deleted = 0
  AND c.title IS NOT NULL AND c.title != ''
ON DUPLICATE KEY UPDATE updated_at = NOW();
