package com.baluga.backend.modules.mount.rag;

import com.baluga.backend.infrastructure.integration.embedding.EmbeddingService;
import com.baluga.backend.modules.mapping.entity.KnowledgePoint;
import com.baluga.backend.modules.mapping.mapper.KnowledgePointMapper;
import com.baluga.backend.modules.mapping.service.VectorStoreService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;


@Component
public class KnowledgePointRetriever {

    private static final Logger log = LoggerFactory.getLogger(KnowledgePointRetriever.class);

    private final EmbeddingService embeddingService;
    private final VectorStoreService vectorStoreService;
    private final KnowledgePointMapper knowledgePointMapper;

    public KnowledgePointRetriever(EmbeddingService embeddingService,
                                    VectorStoreService vectorStoreService,
                                    KnowledgePointMapper knowledgePointMapper) {
        this.embeddingService = embeddingService;
        this.vectorStoreService = vectorStoreService;
        this.knowledgePointMapper = knowledgePointMapper;
    }

    /**
     * Retrieve top-K knowledge points by query text.
     * Uses chunk embedding → pgvector cosine search.
     */
    public List<KPRetrievalResult> retrieve(String queryText, int topK) {
        if (!vectorStoreService.hasKnowledgePoints()) {
            return List.of();
        }

        try {
            float[] queryVec = embeddingService.encode(queryText);
            var searchResults = vectorStoreService.searchSimilar(queryVec, "knowledge_point", topK);

            List<KPRetrievalResult> results = new ArrayList<>();
            for (var sr : searchResults) {
                double similarity = 1.0 - sr.distance();
                KnowledgePoint kp = knowledgePointMapper.selectById(sr.targetId());
                if (kp != null) {
                    results.add(new KPRetrievalResult(kp, similarity));
                }
            }
            log.debug("RAG retrieved {} KPs for query (topK={})", results.size(), topK);
            return results;
        } catch (Exception e) {
            log.warn("RAG retrieval failed: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Embed all knowledge points that don't have embeddings yet.
     * Returns count of newly embedded KPs.
     */
    public int ensureKnowledgePointsEmbedded() {
        if (!vectorStoreService.hasKnowledgePoints()) {
            log.info("No KP embeddings found, embedding all knowledge points...");
            var allKps = knowledgePointMapper.selectList(null);
            int count = 0;
            for (var kp : allKps) {
                try {
                    String text = kp.getName()
                            + (kp.getDescription() != null ? " " + kp.getDescription() : "");
                    float[] emb = embeddingService.encode(text);
                    vectorStoreService.insertKnowledgePointEmbedding(kp.getId(), emb);
                    count++;
                } catch (Exception e) {
                    log.warn("Failed to embed KP {}: {}", kp.getId(), e.getMessage());
                }
            }
            log.info("Embedded {} knowledge points", count);
            return count;
        }
        return 0;
    }

    public record KPRetrievalResult(KnowledgePoint kp, double similarity) {}
}
