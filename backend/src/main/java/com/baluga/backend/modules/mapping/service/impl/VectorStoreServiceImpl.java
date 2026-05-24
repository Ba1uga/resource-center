package com.baluga.backend.modules.mapping.service.impl;

import com.baluga.backend.modules.mapping.service.VectorStoreService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class VectorStoreServiceImpl implements VectorStoreService {

    private static final Logger log = LoggerFactory.getLogger(VectorStoreServiceImpl.class);

    private final JdbcTemplate jdbcTemplate;

    public VectorStoreServiceImpl(@Qualifier("pgvectorJdbcTemplate") JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void insertChunkEmbedding(Long chunkId, float[] embedding) {
        insert("chunk", chunkId, "chunk", embedding);
    }

    @Override
    public void insertKnowledgePointEmbedding(Long kpId, float[] embedding) {
        insert("knowledge_point", kpId, "knowledge_point", embedding);
    }

    private void insert(String embeddingType, Long targetId, String targetType, float[] vector) {
        String vectorStr = toPgVectorString(vector);
        jdbcTemplate.update(
                "INSERT INTO resource_embedding (embedding_type, target_id, target_type, embedding) VALUES (?, ?, ?, ?::vector)",
                embeddingType, targetId, targetType, vectorStr);
    }

    @Override
    public List<VectorSearchResult> searchSimilar(float[] queryVec, String targetType, int topK) {
        String vectorStr = toPgVectorString(queryVec);
        String sql = "SELECT target_id, target_type, 1.0 - (embedding <=> ?::vector) AS similarity FROM resource_embedding WHERE target_type = ? ORDER BY embedding <=> ?::vector LIMIT ?";
        return jdbcTemplate.query(sql,
                (rs, rowNum) -> new VectorSearchResult(
                        rs.getLong("target_id"),
                        rs.getString("target_type"),
                        1.0 - rs.getDouble("similarity")),
                vectorStr, targetType, vectorStr, topK);
    }

    @Override
    public boolean hasKnowledgePoints() {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM resource_embedding WHERE target_type = 'knowledge_point'", Integer.class);
        return count != null && count > 0;
    }

    private String toPgVectorString(float[] vec) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < vec.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(vec[i]);
        }
        sb.append("]");
        return sb.toString();
    }
}
