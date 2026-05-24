package com.baluga.backend.modules.mount.engine;

import com.baluga.backend.infrastructure.integration.embedding.EmbeddingService;
import com.baluga.backend.modules.mapping.service.VectorStoreService;
import com.baluga.backend.modules.mapping.service.VectorStoreService.VectorSearchResult;
import com.baluga.backend.modules.mount.dto.MountCandidate;
import com.baluga.backend.modules.mount.dto.ResourceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;


@Component
public class EmbeddingMatchEngine implements MountStrategy {

    private static final Logger log = LoggerFactory.getLogger(EmbeddingMatchEngine.class);

    private final EmbeddingService embeddingService;
    private final VectorStoreService vectorStoreService;

    public EmbeddingMatchEngine(EmbeddingService embeddingService,
                                 VectorStoreService vectorStoreService) {
        this.embeddingService = embeddingService;
        this.vectorStoreService = vectorStoreService;
    }

    @Override
    public String getName() { return "embedding"; }

    @Override
    public int getPriority() { return 3; }

    @Override
    public boolean supports(ResourceContext ctx) {
        return ctx.getChunkTexts() != null && !ctx.getChunkTexts().isEmpty()
                && vectorStoreService.hasKnowledgePoints();
    }

    @Override
    public List<MountCandidate> execute(ResourceContext ctx, KnowledgeGraphScope scope) {
        List<MountCandidate> results = new ArrayList<>();

        try {
            // 1. Encode resource chunk texts
            List<float[]> chunkVecs = new ArrayList<>();
            for (String text : ctx.getChunkTexts()) {
                try {
                    chunkVecs.add(embeddingService.encode(text));
                } catch (Exception e) {
                    log.debug("Chunk encoding failed: {}", e.getMessage());
                }
            }

            if (chunkVecs.isEmpty()) return results;

            // 2. Average pooling to get resource vector
            float[] resourceVec = averagePooling(chunkVecs);

            // 3. Search similar knowledge points in pgvector
            List<VectorSearchResult> searchResults = vectorStoreService.searchSimilar(
                    resourceVec, "knowledge_point", 20);

            // 4. Convert to MountCandidate
            for (VectorSearchResult r : searchResults) {
                double similarity = 1.0 - r.distance();
                String confidence = similarity > 0.85 ? "high" : similarity > 0.6 ? "medium" : "low";
                String nodeName = resolveNodeName(scope, r.targetId());
                if (nodeName == null) continue;

                results.add(new MountCandidate(
                        r.targetId(),
                        nodeName,
                        "knowledge_point",
                        3,
                        "embedding",
                        similarity,
                        confidence
                ));
            }

            log.debug("EmbeddingMatchEngine returned {} candidates", results.size());
        } catch (Exception e) {
            log.warn("EmbeddingMatchEngine failed: {}", e.getMessage());
        }

        return results;
    }

    private String resolveNodeName(KnowledgeGraphScope scope, long nodeId) {
        for (var entry : scope.nodesByType().entrySet()) {
            for (var node : entry.getValue()) {
                if (node.id().equals(nodeId)) return node.name();
            }
        }
        return null;
    }

    private float[] averagePooling(List<float[]> vectors) {
        int dim = vectors.get(0).length;
        float[] avg = new float[dim];
        for (float[] vec : vectors) {
            for (int i = 0; i < dim; i++) {
                avg[i] += vec[i];
            }
        }
        for (int i = 0; i < dim; i++) {
            avg[i] /= vectors.size();
        }
        return avg;
    }
}
