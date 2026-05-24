package com.baluga.backend.infrastructure.integration.chunking;

import com.baluga.backend.infrastructure.integration.parsing.DocumentParser.ChunkHint;

import java.util.List;


public interface ChunkStrategy {

    List<Chunk> chunk(String fullText, List<ChunkHint> hints, ChunkConfig config);

    record Chunk(
            String text,
            int tokenCount,
            String contentType,
            Integer pageNumber,
            Integer slideNumber,
            String sectionTitle
    ) {}

    record ChunkConfig(
            int maxTokens,
            int overlapTokens,
            String resourceType
    ) {
        public static ChunkConfig forResource(String resourceType) {
            int max = switch (resourceType) {
                case "question" -> 2000;
                case "video" -> 800;
                default -> 500;
            };
            return new ChunkConfig(max, max / 10, resourceType);
        }
    }
}
