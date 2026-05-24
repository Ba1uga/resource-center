package com.baluga.backend.modules.mount.engine;

import org.springframework.stereotype.Component;


@Component
public class ConfidenceCalculator {

    /**
     * Calculate final confidence score from raw fusion score + strategy metadata.
     *
     * Dimensions (normalized to 0~1):
     * - fusionScore (raw weighted average): 40%
     * - strategyCount bonus (more strategies agree): 20%
     * - topConfidence bonus: 15%
     * - consistency penalty (single-strategy results are less reliable): 25%
     *
     * @param rawScore      weighted fusion score (0~1)
     * @param strategyCount how many different strategies contributed
     * @param topConfidence "high" / "medium" / "low"
     * @return final confidence 0~1
     */
    public double calculate(double rawScore, int strategyCount, String topConfidence) {
        double score = 0.0;

        // 1. Raw fusion score (40%)
        score += 0.40 * rawScore;

        // 2. Strategy consensus (25%)
        // 1 strategy = 0.3, 2 = 0.7, 3+ = 1.0
        double consensus = switch (strategyCount) {
            case 1 -> 0.3;
            case 2 -> 0.7;
            default -> 1.0;
        };
        score += 0.25 * consensus;

        // 3. Top confidence bonus (15%)
        double topBonus = switch (topConfidence) {
            case "high" -> 1.0;
            case "medium" -> 0.6;
            default -> 0.2;
        };
        score += 0.15 * topBonus;

        // 4. Historical accuracy proxy (20%)
        // Placeholder until we have real historical data
        // For now: strategyCount > 1 and topConfidence != "low" gives bonus
        double historical = (strategyCount > 1 && !"low".equals(topConfidence)) ? 0.8 : 0.4;
        score += 0.20 * historical;

        return Math.min(1.0, Math.max(0.0, score));
    }
}
