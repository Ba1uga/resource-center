package com.baluga.backend.modules.mount.engine;

import com.baluga.backend.infrastructure.integration.ai.AiMatchingConfig;
import com.baluga.backend.modules.mount.dto.MountCandidate;
import com.baluga.backend.modules.mount.dto.ResourceContext;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;


@Component
public class LLMReasoningMountEngine implements MountStrategy {

    private static final Logger log = LoggerFactory.getLogger(LLMReasoningMountEngine.class);

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final AiMatchingConfig config;

    public LLMReasoningMountEngine(AiMatchingConfig config, ObjectMapper objectMapper) {
        this.config = config;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder()
                .baseUrl(config.getOpenaiBaseUrl())
                .defaultHeader("Authorization", "Bearer " + config.getOpenaiApiKey())
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    @Override
    public String getName() { return "llm"; }

    @Override
    public int getPriority() { return 5; }

    @Override
    public boolean supports(ResourceContext ctx) {
        return config.getOpenaiApiKey() != null && !config.getOpenaiApiKey().isBlank();
    }

    @Override
    public List<MountCandidate> execute(ResourceContext ctx, KnowledgeGraphScope scope) {
        List<MountCandidate> results = new ArrayList<>();

        try {
            // Stage 1: Course matching
            List<MountCandidate> courses = classifyCourse(ctx, scope);
            results.addAll(courses);

            // Stage 2: Chapter matching (within matched courses)
            if (!courses.isEmpty()) {
                List<MountCandidate> chapters = locateChapter(ctx, scope, courses);
                results.addAll(chapters);
            }

            // Stage 3: Knowledge point matching
            List<MountCandidate> kps = matchKnowledgePoints(ctx, scope);
            results.addAll(kps);

        } catch (Exception e) {
            log.error("LLM reasoning failed: {}", e.getMessage());
        }

        return results;
    }

    private List<MountCandidate> classifyCourse(ResourceContext ctx, KnowledgeGraphScope scope) {
        var courseNodes = scope.nodesByType().getOrDefault("course", List.of());
        if (courseNodes.isEmpty()) return List.of();

        try {
            String prompt = buildCoursePrompt(ctx, courseNodes);
            String raw = callLLM(prompt);
            return parseCourseResponse(raw, courseNodes);
        } catch (Exception e) {
            log.warn("LLM course classification failed: {}", e.getMessage());
            return List.of();
        }
    }

    private List<MountCandidate> locateChapter(ResourceContext ctx, KnowledgeGraphScope scope,
                                                List<MountCandidate> courses) {
        var chapterNodes = scope.nodesByType().getOrDefault("chapter", List.of());
        var sectionNodes = scope.nodesByType().getOrDefault("section", List.of());
        List<KnowledgeGraphScope.KnowledgeNode> allChapters = new ArrayList<>();
        allChapters.addAll(chapterNodes);
        allChapters.addAll(sectionNodes);
        if (allChapters.isEmpty()) return List.of();

        try {
            String prompt = buildChapterPrompt(ctx, allChapters);
            String raw = callLLM(prompt);
            return parseChapterResponse(raw, allChapters);
        } catch (Exception e) {
            log.warn("LLM chapter matching failed: {}", e.getMessage());
            return List.of();
        }
    }

    private List<MountCandidate> matchKnowledgePoints(ResourceContext ctx, KnowledgeGraphScope scope) {
        var kpNodes = scope.nodesByType().getOrDefault("knowledge_point", List.of());
        if (kpNodes.isEmpty()) return List.of();

        // Limit to prevent prompt overflow
        List<KnowledgeGraphScope.KnowledgeNode> candidates = kpNodes.size() > 50
                ? kpNodes.subList(0, 50) : kpNodes;

        try {
            String prompt = buildKPPrompt(ctx, candidates);
            String raw = callLLM(prompt);
            return parseKPResponse(raw, candidates);
        } catch (Exception e) {
            log.warn("LLM KP matching failed: {}", e.getMessage());
            return List.of();
        }
    }

    // --- Prompt builders ---

    private String buildCoursePrompt(ResourceContext ctx,
                                      List<KnowledgeGraphScope.KnowledgeNode> courses) {
        StringBuilder sb = new StringBuilder();
        sb.append("你是一位教育内容分类专家。请根据资源信息判断它属于哪门课程。\n\n");
        sb.append("## 已知课程列表\n```json\n");
        try {
            List<Map<String, Object>> list = new ArrayList<>();
            for (var c : courses) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", c.id());
                m.put("name", c.name());
                list.add(m);
            }
            sb.append(objectMapper.writeValueAsString(list));
        } catch (Exception ignored) {}
        sb.append("\n```\n\n");
        sb.append("## 资源信息\n");
        sb.append("- 标题: ").append(ctx.getTitle()).append("\n");
        sb.append("- 类型: ").append(ctx.getResourceType()).append("\n");
        if (ctx.getCourse() != null && !ctx.getCourse().isEmpty()) {
            sb.append("- 已标注课程: ").append(ctx.getCourse()).append("\n");
        }
        sb.append("- 内容摘要: ").append(ctx.contentSnippet(800)).append("\n\n");
        sb.append("返回JSON数组(最多3个), confidence为high/medium/low:\n");
        sb.append("""
                ```json
                [{"nodeId": 1, "confidence": "high", "reasoning": "理由"}]
                ```
                """);
        return sb.toString();
    }

    private String buildChapterPrompt(ResourceContext ctx,
                                       List<KnowledgeGraphScope.KnowledgeNode> chapters) {
        StringBuilder sb = new StringBuilder();
        sb.append("请判断以下资源内容属于哪个章节/小节。\n\n");
        sb.append("## 候选章节\n```json\n");
        try {
            List<Map<String, Object>> list = new ArrayList<>();
            for (var c : chapters) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", c.id());
                m.put("name", c.name());
                m.put("type", c.nodeType());
                list.add(m);
            }
            sb.append(objectMapper.writeValueAsString(list));
        } catch (Exception ignored) {}
        sb.append("\n```\n\n");
        sb.append("资源标题: ").append(ctx.getTitle()).append("\n");
        sb.append("内容摘要: ").append(ctx.contentSnippet(500)).append("\n\n");
        sb.append("返回JSON数组(最多5个):\n");
        sb.append("""
                ```json
                [{"nodeId": 1, "confidence": "high", "reasoning": "理由"}]
                ```
                """);
        return sb.toString();
    }

    private String buildKPPrompt(ResourceContext ctx,
                                  List<KnowledgeGraphScope.KnowledgeNode> kps) {
        StringBuilder sb = new StringBuilder();
        sb.append("你是一位教学知识图谱专家。请分析以下资源内容片段，匹配最相关的知识点。\n\n");
        sb.append("## 候选知识点\n```json\n");
        try {
            List<Map<String, Object>> list = new ArrayList<>();
            for (var kp : kps) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", kp.id());
                m.put("name", kp.name());
                if (kp.description() != null && !kp.description().isEmpty()) {
                    m.put("desc", kp.description());
                }
                list.add(m);
            }
            sb.append(objectMapper.writeValueAsString(list));
        } catch (Exception ignored) {}
        sb.append("\n```\n\n");
        sb.append("## 资源内容\n");
        sb.append(ctx.contentSnippet(1000)).append("\n\n");
        sb.append("返回JSON数组(最多5个), 每个包含nodeId/confidence(reasoning):\n");
        sb.append("""
                ```json
                [{"nodeId": 1, "confidence": "high", "reasoning": "匹配依据"}]
                ```
                """);
        return sb.toString();
    }

    // --- LLM call ---

    private String callLLM(String prompt) {
        Map<String, Object> body = Map.of(
                "model", config.getOpenaiModel(),
                "messages", List.of(
                        Map.of("role", "system", "content", "你是一位教育内容分类助手，只返回JSON数组，不要解释。"),
                        Map.of("role", "user", "content", prompt)
                ),
                "max_tokens", 2048,
                "temperature", 0.1
        );

        String resp = restClient.post()
                .uri("/chat/completions")
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(String.class);

        try {
            JsonNode root = objectMapper.readTree(resp);
            return root.get("choices").get(0).get("message").get("content").asText();
        } catch (Exception e) {
            throw new RuntimeException("LLM response parse failed", e);
        }
    }

    // --- Response parsers ---

    private List<MountCandidate> parseCourseResponse(String raw,
            List<KnowledgeGraphScope.KnowledgeNode> courses) {
        return parseNodeResponse(raw, courses, "course", 1);
    }

    private List<MountCandidate> parseChapterResponse(String raw,
            List<KnowledgeGraphScope.KnowledgeNode> chapters) {
        return parseNodeResponse(raw, chapters, "chapter", 2);
    }

    private List<MountCandidate> parseKPResponse(String raw,
            List<KnowledgeGraphScope.KnowledgeNode> kps) {
        return parseNodeResponse(raw, kps, "knowledge_point", 3);
    }

    private List<MountCandidate> parseNodeResponse(String raw,
            List<KnowledgeGraphScope.KnowledgeNode> nodes,
            String defaultType, int defaultLevel) {
        List<MountCandidate> results = new ArrayList<>();
        String json = raw.trim();
        if (json.startsWith("```")) {
            json = json.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
        }

        try {
            JsonNode arr = objectMapper.readTree(json);
            if (!arr.isArray()) return results;

            for (JsonNode item : arr) {
                long nodeId = item.get("nodeId").asLong();
                String confidence = item.has("confidence") ? item.get("confidence").asText() : "medium";
                String reasoning = item.has("reasoning") ? item.get("reasoning").asText() : "";

                var node = nodes.stream().filter(n -> n.id() == nodeId).findFirst().orElse(null);
                if (node == null) continue;

                double score = confidenceToScore(confidence);
                MountCandidate c = new MountCandidate(
                        node.id(), node.name(),
                        node.nodeType() != null ? node.nodeType() : defaultType,
                        node.nodeLevel() != null ? node.nodeLevel() : defaultLevel,
                        "llm", score, confidence
                );
                c.setEvidence(reasoning);
                results.add(c);
            }
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse LLM response: {}", e.getMessage());
        }
        return results;
    }

    private double confidenceToScore(String conf) {
        return switch (conf) {
            case "high" -> 0.9;
            case "medium" -> 0.7;
            case "low" -> 0.4;
            default -> 0.5;
        };
    }
}
