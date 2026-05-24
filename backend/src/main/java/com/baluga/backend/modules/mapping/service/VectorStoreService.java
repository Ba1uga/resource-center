package com.baluga.backend.modules.mapping.service;

import java.util.List;


public interface VectorStoreService {

    void insertChunkEmbedding(Long chunkId, float[] embedding);

    void insertKnowledgePointEmbedding(Long kpId, float[] embedding);

    List<VectorSearchResult> searchSimilar(float[] queryVec, String targetType, int topK);

    boolean hasKnowledgePoints();

    record VectorSearchResult(long targetId, String targetType, double distance) {
        public double distance() { return distance; }
    }
}
