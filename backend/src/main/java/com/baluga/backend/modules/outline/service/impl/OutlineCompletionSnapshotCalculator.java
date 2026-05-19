package com.baluga.backend.modules.outline.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;


@Component
@RequiredArgsConstructor
public class OutlineCompletionSnapshotCalculator {

    private static final int TOTAL_SECTION_COUNT = 6;

    private final ObjectMapper objectMapper;

    public OutlineCompletionSnapshot calculate(String sectionsJson) {
        try {
            JsonNode root = objectMapper.readTree(sectionsJson);

            boolean basicInfoComplete = root.path("basicInfo").path("courseName").asText("").trim().length() > 0
                    && root.path("basicInfo").path("credits").asInt(0) > 0
                    && root.path("basicInfo").path("hours").asInt(0) > 0
                    && root.path("basicInfo").path("instructor").asText("").trim().length() > 0
                    && root.path("basicInfo").path("majors").isArray()
                    && root.path("basicInfo").path("majors").size() > 0;

            boolean goalsComplete = hasNonBlankText(root.path("knowledgeGoals"))
                    && hasNonBlankText(root.path("abilityGoals"));

            boolean scheduleComplete = root.path("schedule").isArray() && root.path("schedule").size() > 0;

            boolean methodsComplete = root.path("teachingMethods").path("selected").isArray()
                    && root.path("teachingMethods").path("selected").size() > 0
                    || root.path("teachingMethods").path("notes").asText("").trim().length() > 0;

            int assessmentTotal = root.path("assessment").path("usualPercentage").asInt(0)
                    + root.path("assessment").path("midtermPercentage").asInt(0)
                    + root.path("assessment").path("finalPercentage").asInt(0);
            boolean assessmentComplete = assessmentTotal == 100;

            boolean materialsComplete = root.path("materials").path("primary").isArray()
                    && root.path("materials").path("primary").size() > 0;

            int completedSectionCount = 0;
            int issueCount = 0;

            if (basicInfoComplete) {
                completedSectionCount++;
            } else {
                issueCount++;
            }

            if (goalsComplete) {
                completedSectionCount++;
            } else {
                issueCount++;
            }

            if (scheduleComplete) {
                completedSectionCount++;
            } else {
                issueCount++;
            }

            if (methodsComplete) {
                completedSectionCount++;
            } else {
                issueCount++;
            }

            if (assessmentComplete) {
                completedSectionCount++;
            } else {
                issueCount++;
            }

            if (materialsComplete) {
                completedSectionCount++;
            } else {
                issueCount++;
            }

            int percent = Math.round((completedSectionCount / (float) TOTAL_SECTION_COUNT) * 100);
            String state = issueCount == 0 ? "complete" : percent >= 80 ? "nearly-complete" : "needs-completion";

            return new OutlineCompletionSnapshot(percent, issueCount, state);
        } catch (Exception ex) {
            throw new IllegalStateException("大纲完整度计算失败", ex);
        }
    }

    private boolean hasNonBlankText(JsonNode arrayNode) {
        if (!arrayNode.isArray()) {
            return false;
        }

        for (JsonNode item : arrayNode) {
            if (item.path("text").asText("").trim().length() > 0) {
                return true;
            }
        }

        return false;
    }
}
