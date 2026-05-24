package com.baluga.backend.modules.mount.engine;

import java.util.List;
import java.util.Map;


public record KnowledgeGraphScope(
        Map<String, List<KnowledgeNode>> nodesByType
) {

    public record KnowledgeNode(
            Long id,
            String name,
            String nodeType,
            Integer nodeLevel,
            Long parentId,
            String course,
            String chapter,
            String description,
            String keywords,
            String difficulty,
            Integer bloomLevel
    ) {}
}
