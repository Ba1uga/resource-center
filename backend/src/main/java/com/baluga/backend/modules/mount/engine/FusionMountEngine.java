package com.baluga.backend.modules.mount.engine;

import com.baluga.backend.modules.mount.dto.MountCandidate;
import com.baluga.backend.modules.mount.dto.MountDecision;
import com.baluga.backend.modules.mount.dto.ResourceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Component
public class FusionMountEngine {

    private static final Logger log = LoggerFactory.getLogger(FusionMountEngine.class);

    /**
     * Strategy weights (configurable, adjusted when strategies are unavailable).
     * ┌────────────────┬────────┬─────────────────────────────┐
     * │ Strategy       │ Weight │ Note                         │
     * ├────────────────┼────────┼─────────────────────────────┤
     * │ rule           │ 1.5    │ Always runs, boosted without embedding │
     * │ llm            │ 4.0    │ Most important, boosted without embedding │
     * │ keyword        │ 1.5    │ BM25/Jaccard, always runs                │
     * │ embedding      │ 0.0    │ Disabled until Sprint 4                  │
     * └────────────────┴────────┴─────────────────────────────┘
     */

    private final Map<String, Double> WEIGHTS = new HashMap<>();
    {
        WEIGHTS.put("rule", 1.5);
        WEIGHTS.put("llm", 4.0);
        WEIGHTS.put("keyword", 1.5);
        WEIGHTS.put("embedding", 2.0); // ready for Sprint 4
    }

    private final List<MountStrategy> strategies;
    private final ConfidenceCalculator confidenceCalculator;

    public FusionMountEngine(List<MountStrategy> strategies,
                              ConfidenceCalculator confidenceCalculator) {
        this.strategies = strategies.stream()
                .sorted(Comparator.comparingInt(MountStrategy::getPriority))
                .toList();
        this.confidenceCalculator = confidenceCalculator;
    }

    /**
     * Run all applicable strategies and fuse results.
     */
    public MountResult fuse(ResourceContext ctx, KnowledgeGraphScope scope) {
        List<MountCandidate> allCandidates = new ArrayList<>();

        for (MountStrategy strategy : strategies) {
            if (!strategy.supports(ctx)) {
                log.debug("Strategy '{}' not applicable, skipping", strategy.getName());
                continue;
            }
            try {
                List<MountCandidate> results = strategy.execute(ctx, scope);
                allCandidates.addAll(results);
                log.debug("Strategy '{}' returned {} candidates", strategy.getName(), results.size());
            } catch (Exception e) {
                log.error("Strategy '{}' failed: {}", strategy.getName(), e.getMessage());
            }
        }

        // Group by nodeId, fuse scores
        Map<Long, FusionAccumulator> accumulators = new HashMap<>();
        for (MountCandidate c : allCandidates) {
            accumulators.computeIfAbsent(c.getNodeId(),
                    k -> new FusionAccumulator(c)).merge(c);
        }

        // Convert to decisions
        List<MountDecision> decisions = accumulators.values().stream()
                .map(acc -> {
                    double rawScore = acc.weightedScore();
                    double finalScore = confidenceCalculator.calculate(
                            rawScore, acc.strategies.size(), acc.topConfidence);
                    MountDecision d = acc.candidate.toDecision(finalScore);
                    d.setContributingStrategies(acc.strategies);
                    return d;
                })
                .sorted((a, b) -> Double.compare(b.getFusionScore(), a.getFusionScore()))
                .collect(Collectors.toList());

        // Group by node level
        List<MountDecision> courses = filterByType(decisions, "course");
        List<MountDecision> chapters = filterByType(decisions, "chapter", "section");
        List<MountDecision> kps = filterByType(decisions, "knowledge_point");

        return new MountResult(courses, chapters, kps, allCandidates, decisions);
    }

    private List<MountDecision> filterByType(List<MountDecision> decisions, String... types) {
        List<String> typeList = List.of(types);
        return decisions.stream()
                .filter(d -> typeList.contains(d.getNodeType()))
                .limit(5)
                .collect(Collectors.toList());
    }

    public record MountResult(
            List<MountDecision> courseMatches,
            List<MountDecision> chapterMatches,
            List<MountDecision> knowledgePointMatches,
            List<MountCandidate> allCandidates,
            List<MountDecision> topDecisions
    ) {}

    private class FusionAccumulator {
        MountCandidate candidate;
        List<String> strategies = new ArrayList<>();
        double weightedSum = 0;
        double weightSum = 0;
        String topConfidence = "low";

        FusionAccumulator(MountCandidate c) { this.candidate = c; }

        void merge(MountCandidate c) {
            double w = WEIGHTS.getOrDefault(c.getStrategyName(), 1.0);
            weightedSum += c.getStrategyScore() * w;
            weightSum += w;
            strategies.add(c.getStrategyName());
            if (c.getEvidence() != null && !c.getEvidence().isEmpty()) {
                candidate.setEvidence(c.getEvidence());
            }
            if ("high".equals(c.getConfidence())) topConfidence = "high";
            else if ("medium".equals(c.getConfidence()) && !"high".equals(topConfidence))
                topConfidence = "medium";
            candidate.setMountPath(buildMountPath(candidate.getMountPath(), c.getNodeName()));
        }

        double weightedScore() {
            return weightSum > 0 ? weightedSum / weightSum : 0;
        }
    }

    private String buildMountPath(String existing, String newSegment) {
        if (existing == null || existing.isEmpty()) return newSegment;
        if (existing.contains(newSegment)) return existing;
        return existing + " > " + newSegment;
    }
}
