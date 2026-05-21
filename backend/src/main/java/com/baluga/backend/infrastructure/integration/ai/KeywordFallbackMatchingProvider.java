package com.baluga.backend.infrastructure.integration.ai;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Keyword-based fallback matching that requires no API key.
 * Uses character-bigram Jaccard similarity between resource title and knowledge point names.
 */
public class KeywordFallbackMatchingProvider implements AiMatchingProvider {

    @Override
    public boolean isAvailable() {
        return true;
    }

    @Override
    public String getProviderName() {
        return "KeywordFallback";
    }

    @Override
    public List<ResourceMatchResponse> match(ResourceMatchRequest request) {
        List<ResourceMatchResponse> results = new ArrayList<>();

        for (ResourceInfo resource : request.resources()) {
            List<ScoredKp> scored = new ArrayList<>();
            for (KnowledgePointInfo kp : request.knowledgePoints()) {
                String resourceCourse = resource.course() != null ? resource.course() : "";
                String kpCourse = kp.course() != null ? kp.course() : "";
                if (!resourceCourse.equals(kpCourse)) {
                    continue;
                }
                double score = computeJaccardSimilarity(
                        normalize(resource.title()),
                        normalize(kp.name())
                );
                String confidence = score >= 0.5 ? "high" : (score >= 0.2 ? "medium" : "low");
                scored.add(new ScoredKp(kp.index(), confidence, score,
                        "关键词匹配相似度 " + String.format("%.0f%%", score * 100)));
            }

            scored.sort(Comparator.comparingDouble(ScoredKp::score).reversed());

            List<KnowledgePointMatch> matches = scored.stream()
                    .limit(request.maxCandidatesPerResource())
                    .map(s -> new KnowledgePointMatch(s.kpIndex(), s.confidence(), s.reasoning()))
                    .collect(Collectors.toList());

            results.add(new ResourceMatchResponse(resource.index(), matches));
        }

        return results;
    }

    private String normalize(String text) {
        if (text == null) return "";
        return text.toLowerCase()
                .replaceAll("[，。；！？、；：\"\"''（）【】《》\\s]+", "")
                .replaceAll("[,.!?;:'\"()\\[\\]{}]+", "");
    }

    private double computeJaccardSimilarity(String a, String b) {
        if (a.isEmpty() && b.isEmpty()) return 0.0;
        if (a.isEmpty() || b.isEmpty()) return 0.0;

        Set<String> setA = new HashSet<>();
        Set<String> setB = new HashSet<>();

        for (int i = 0; i < a.length() - 1; i++) {
            setA.add(a.substring(i, i + 2));
        }
        for (int i = 0; i < b.length() - 1; i++) {
            setB.add(b.substring(i, i + 2));
        }

        Set<String> intersection = new HashSet<>(setA);
        intersection.retainAll(setB);

        Set<String> union = new HashSet<>(setA);
        union.addAll(setB);

        if (union.isEmpty()) return 0.0;
        return (double) intersection.size() / union.size();
    }

    private record ScoredKp(int kpIndex, String confidence, double score, String reasoning) {}
}
