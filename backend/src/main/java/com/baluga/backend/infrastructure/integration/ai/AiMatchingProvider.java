package com.baluga.backend.infrastructure.integration.ai;

import java.util.List;


public interface AiMatchingProvider {

    List<AiMatchingProvider.ResourceMatchResponse> match(AiMatchingProvider.ResourceMatchRequest request);

    boolean isAvailable();

    String getProviderName();

    record ResourceInfo(
            int index,
            Long resourceId,
            String title,
            String type,
            String course,
            String chapter,
            String contentSnippet
    ) {}

    record KnowledgePointInfo(
            int index,
            Long id,
            String name,
            String course,
            String chapter,
            String description
    ) {}

    record ResourceMatchRequest(
            List<ResourceInfo> resources,
            List<KnowledgePointInfo> knowledgePoints,
            int maxCandidatesPerResource
    ) {}

    record KnowledgePointMatch(
            int knowledgePointIndex,
            String confidence,
            String reasoning
    ) {}

    record ResourceMatchResponse(
            int resourceIndex,
            List<KnowledgePointMatch> matches
    ) {}
}
