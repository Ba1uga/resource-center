package com.baluga.backend.infrastructure.integration.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

/**
 * Calls an OpenAI-compatible LLM API for resource-to-knowledge-point matching.
 * Falls back to KeywordFallbackMatchingProvider on failure.
 */
public class OpenAiCompatibleMatchingProvider implements AiMatchingProvider {

    private static final Logger log = LoggerFactory.getLogger(OpenAiCompatibleMatchingProvider.class);

    private final AiMatchingConfig config;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final KeywordFallbackMatchingProvider fallback;

    public OpenAiCompatibleMatchingProvider(AiMatchingConfig config, ObjectMapper objectMapper) {
        this.config = config;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder()
                .baseUrl(config.getOpenaiBaseUrl())
                .defaultHeader("Authorization", "Bearer " + config.getOpenaiApiKey())
                .defaultHeader("Content-Type", "application/json")
                .build();
        this.fallback = new KeywordFallbackMatchingProvider();
    }

    @Override
    public boolean isAvailable() {
        return config.getOpenaiApiKey() != null && !config.getOpenaiApiKey().isBlank();
    }

    @Override
    public String getProviderName() {
        return "OpenAI (" + config.getOpenaiModel() + ")";
    }

    @Override
    public List<ResourceMatchResponse> match(ResourceMatchRequest request) {
        if (!isAvailable()) {
            log.warn("OpenAI API key not configured, falling back to keyword matching");
            return fallback.match(request);
        }

        for (int attempt = 0; attempt <= config.getMaxRetries(); attempt++) {
            try {
                String prompt = buildPrompt(request, attempt > 0);
                String rawResponse = callApi(prompt);
                return parseResponse(rawResponse, request);
            } catch (Exception ex) {
                log.error("AI matching attempt {} failed: {}", attempt + 1, ex.getMessage());
                if (attempt < config.getMaxRetries()) {
                    sleepBeforeRetry(attempt);
                }
            }
        }

        log.warn("All AI matching attempts failed, falling back to keyword matching");
        return fallback.match(request);
    }

    private String callApi(String prompt) throws JsonProcessingException {
        Map<String, Object> body = Map.of(
                "model", config.getOpenaiModel(),
                "messages", List.of(
                        Map.of("role", "system", "content", "你是一位教学资源分类助手，只返回JSON数组，不要解释。"),
                        Map.of("role", "user", "content", prompt)
                ),
                "max_tokens", config.getMaxTokens(),
                "temperature", config.getTemperature()
        );

        String responseBody = restClient.post()
                .uri("/chat/completions")
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .onStatus(status -> status.value() >= 400, (req, resp) -> {
                    throw new IllegalStateException("AI API error: " + resp.getStatusCode());
                })
                .body(String.class);

        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode choices = root.get("choices");
        if (choices == null || choices.isEmpty()) {
            throw new IllegalStateException("AI API returned empty choices");
        }

        return choices.get(0).get("message").get("content").asText();
    }

    private String buildPrompt(ResourceMatchRequest request, boolean simplified) {
        StringBuilder sb = new StringBuilder();
        sb.append("以下是知识点的列表：\n```json\n");
        sb.append(writeJson(request.knowledgePoints()));
        sb.append("\n```\n\n以下是需要匹配的资源列表：\n```json\n");

        List<Map<String, Object>> resourceList = new ArrayList<>();
        for (ResourceInfo ri : request.resources()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("index", ri.index());
            m.put("title", ri.title());
            m.put("type", ri.type());
            m.put("course", ri.course());
            m.put("chapter", ri.chapter());
            if (!simplified) {
                m.put("contentSnippet", ri.contentSnippet());
            }
            resourceList.add(m);
        }
        sb.append(writeJson(resourceList));
        sb.append("\n```\n\n");
        sb.append("请为每个资源匹配最相关的知识点（最多").append(request.maxCandidatesPerResource()).append("个）。");
        sb.append("只返回如下格式的 JSON 数组，不要任何额外文字：\n```json\n[\n");
        sb.append("  {\n    \"resourceIndex\": 0,\n    \"matches\": [\n");
        sb.append("      {\"knowledgePointIndex\": 0, \"confidence\": \"high\", \"reasoning\": \"匹配理由\"}\n");
        sb.append("    ]\n  }\n]\n```\n");
        sb.append("confidence 只能是 high、medium、low。同课程内的资源只需要匹配同课程内的知识点。");

        return sb.toString();
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(value);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    private List<ResourceMatchResponse> parseResponse(String raw, ResourceMatchRequest request) throws JsonProcessingException {
        String json = raw.trim();
        if (json.startsWith("```")) {
            json = json.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
        }

        JsonNode root = objectMapper.readTree(json);
        if (!root.isArray()) {
            throw new IllegalStateException("AI response is not a JSON array: " + json.substring(0, Math.min(200, json.length())));
        }

        Set<Integer> resourceIndexes = new HashSet<>();
        for (ResourceInfo ri : request.resources()) {
            resourceIndexes.add(ri.index());
        }
        Set<Integer> kpIndexes = new HashSet<>();
        for (KnowledgePointInfo kp : request.knowledgePoints()) {
            kpIndexes.add(kp.index());
        }

        List<ResourceMatchResponse> results = new ArrayList<>();
        for (JsonNode item : root) {
            int resourceIndex = item.get("resourceIndex").asInt();
            if (!resourceIndexes.contains(resourceIndex)) {
                log.warn("AI returned unknown resourceIndex {}, skipping", resourceIndex);
                continue;
            }

            JsonNode matchesNode = item.get("matches");
            List<KnowledgePointMatch> matches = new ArrayList<>();
            if (matchesNode != null && matchesNode.isArray()) {
                for (JsonNode match : matchesNode) {
                    int kpIndex = match.get("knowledgePointIndex").asInt();
                    if (!kpIndexes.contains(kpIndex)) {
                        log.warn("AI returned unknown knowledgePointIndex {}, skipping", kpIndex);
                        continue;
                    }
                    String confidence = normalizeConfidence(match.get("confidence").asText());
                    String reasoning = match.has("reasoning") ? match.get("reasoning").asText() : "";
                    matches.add(new KnowledgePointMatch(kpIndex, confidence, reasoning));
                }
            }
            results.add(new ResourceMatchResponse(resourceIndex, matches));
        }

        return results;
    }

    private String normalizeConfidence(String raw) {
        if (raw == null) return "low";
        String lower = raw.trim().toLowerCase();
        if (lower.equals("high") || lower.contains("高")) return "high";
        if (lower.equals("medium") || lower.contains("中")) return "medium";
        return "low";
    }

    private void sleepBeforeRetry(int attempt) {
        try {
            Thread.sleep((long) Math.pow(2, attempt) * 1000);
        } catch (InterruptedException ignored) {
            Thread.currentThread().interrupt();
        }
    }
}
