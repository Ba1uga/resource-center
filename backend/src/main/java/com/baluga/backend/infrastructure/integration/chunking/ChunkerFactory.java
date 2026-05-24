package com.baluga.backend.infrastructure.integration.chunking;

import java.util.Map;


public class ChunkerFactory {

    private final Map<String, ChunkStrategy> strategyMap;

    public ChunkerFactory() {
        this.strategyMap = Map.of(
                "question", new QuestionChunker(),
                "courseware", new SemanticChunker(),
                "article", new SemanticChunker(),
                "video", new FixedSizeChunker(),
                "excerpt", new SemanticChunker()
        );
    }

    public ChunkStrategy getStrategy(String resourceType) {
        return strategyMap.getOrDefault(resourceType, new SemanticChunker());
    }
}
