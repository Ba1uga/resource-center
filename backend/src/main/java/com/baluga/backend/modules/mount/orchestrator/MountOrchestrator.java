package com.baluga.backend.modules.mount.orchestrator;

import com.baluga.backend.modules.mapping.entity.AiMountTask;
import com.baluga.backend.modules.mapping.entity.ResourceContent;
import com.baluga.backend.modules.mapping.entity.ResourceChunk;
import com.baluga.backend.modules.mapping.entity.ResourceMountRelation;
import com.baluga.backend.modules.mapping.entity.MountReviewRecord;
import com.baluga.backend.modules.mapping.mapper.AiMountTaskMapper;
import com.baluga.backend.modules.mapping.mapper.ResourceMountRelationMapper;
import com.baluga.backend.modules.mapping.mapper.MountReviewRecordMapper;
import com.baluga.backend.modules.mapping.service.ChunkService;
import com.baluga.backend.modules.mapping.service.ResourceParseService;
import com.baluga.backend.modules.mount.dto.MountDecision;
import com.baluga.backend.modules.mount.dto.ResourceContext;
import com.baluga.backend.modules.mount.engine.FusionMountEngine;
import com.baluga.backend.modules.mount.engine.KnowledgeGraphScope;
import com.baluga.backend.modules.mount.rag.KnowledgePointRetriever;
import com.baluga.backend.modules.mount.engine.KnowledgeGraphScope.KnowledgeNode;
import com.baluga.backend.modules.mapping.entity.KnowledgePoint;
import com.baluga.backend.modules.mapping.mapper.KnowledgePointMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;


@Component
public class MountOrchestrator {

    private static final Logger log = LoggerFactory.getLogger(MountOrchestrator.class);

    private final ResourceParseService resourceParseService;
    private final ChunkService chunkService;
    private final FusionMountEngine fusionEngine;
    private final KnowledgePointMapper knowledgePointMapper;
    private final AiMountTaskMapper taskMapper;
    private final ResourceMountRelationMapper mountRelationMapper;
    private final MountReviewRecordMapper reviewRecordMapper;
    private final KnowledgePointRetriever kpRetriever;

    public MountOrchestrator(ResourceParseService resourceParseService,
                              ChunkService chunkService,
                              FusionMountEngine fusionEngine,
                              KnowledgePointMapper knowledgePointMapper,
                              AiMountTaskMapper taskMapper,
                              ResourceMountRelationMapper mountRelationMapper,
                              MountReviewRecordMapper reviewRecordMapper,
                              KnowledgePointRetriever kpRetriever) {
        this.resourceParseService = resourceParseService;
        this.chunkService = chunkService;
        this.fusionEngine = fusionEngine;
        this.knowledgePointMapper = knowledgePointMapper;
        this.taskMapper = taskMapper;
        this.mountRelationMapper = mountRelationMapper;
        this.reviewRecordMapper = reviewRecordMapper;
        this.kpRetriever = kpRetriever;
    }

    /**
     * Execute the full mount pipeline synchronously. Called from @Async task processor.
     */
    public void executeFullPipeline(AiMountTask task) {
        try {
            // Phase 1: Parse
            updateTask(task, "parsing", 0.05, "解析文档内容...");
            ResourceContent content = resourceParseService.getOrParse(
                    task.getResourceType(), task.getResourceId());
            if (content == null || !"completed".equals(content.getParseStatus())) {
                failTask(task, "文档解析失败: " +
                        (content != null ? content.getParseError() : "内容为空"));
                return;
            }
            updateTask(task, "parsing", 0.20, "文档解析完成");

            // Phase 2: Chunk
            updateTask(task, "chunking", 0.20, "智能分块...");
            List<ResourceChunk> chunks = chunkService.chunkAndPersist(content);
            updateTask(task, "chunking", 0.30, String.format("分块完成: %d块", chunks.size()));

            // Phase 3: Build context + knowledge graph scope
            updateTask(task, "matching", 0.30, "构建知识图谱...");
            ResourceContext ctx = buildContext(task, content, chunks);
            KnowledgeGraphScope scope = buildScope(task);

            // Ensure knowledge points are embedded for RAG
            kpRetriever.ensureKnowledgePointsEmbedded();

            // Phase 4: Multi-strategy fusion
            updateTask(task, "matching", 0.35, "AI多策略匹配中...");
            FusionMountEngine.MountResult result = fusionEngine.fuse(ctx, scope);
            updateTask(task, "matching", 0.70, String.format(
                    "匹配完成: %d条候选", result.topDecisions().size()));

            // Phase 5: Decide and mount
            updateTask(task, "deciding", 0.70, "评估置信度...");
            int autoMounted = 0;
            int reviewQueued = 0;

            for (MountDecision decision : result.topDecisions()) {
                if (decision.isAutoApprovable()) {
                    createMountRelation(task, decision, "ai_auto");
                    autoMounted++;
                } else if (decision.needsReview()) {
                    Long relId = createMountRelation(task, decision, "ai_recommend");
                    createReviewRecord(task, decision, relId);
                    reviewQueued++;
                }
            }

            // Phase 6: Complete
            task.setStatus(autoMounted > 0 || reviewQueued > 0 ? "completed" : "reviewing");
            task.setTotalItems(result.topDecisions().size());
            task.setCompletedItems(autoMounted);
            task.setFailedItems(result.topDecisions().size() - autoMounted - reviewQueued);
            updateTask(task, task.getStatus(), 1.0, String.format(
                    "完成: 自动挂载%d, 待审核%d", autoMounted, reviewQueued));

        } catch (Exception e) {
            log.error("挂载任务 {} 失败", task.getId(), e);
            failTask(task, e.getMessage());
        }
    }

    private void updateTask(AiMountTask task, String phase, double progress, String detail) {
        task.setCurrentPhase(phase);
        task.setProgress(BigDecimal.valueOf(Math.min(1.0, progress)));
        task.setPhaseDetail(detail);
        taskMapper.updateById(task);
    }

    private void failTask(AiMountTask task, String error) {
        task.setStatus("failed");
        task.setErrorMessage(error != null && error.length() > 1000
                ? error.substring(0, 1000) : error);
        task.setCompletedAt(LocalDateTime.now());
        taskMapper.updateById(task);
    }

    private ResourceContext buildContext(AiMountTask task, ResourceContent content,
                                          List<ResourceChunk> chunks) {
        ResourceContext ctx = new ResourceContext();
        ctx.setResourceId(task.getResourceId());
        ctx.setResourceType(task.getResourceType());
        ctx.setFullText(content.getFullText());

        if (!chunks.isEmpty()) {
            ctx.setChunkTexts(chunks.stream()
                    .map(ResourceChunk::getChunkText)
                    .collect(Collectors.toList()));
        }

        // Extract title from content
        String title = extractTitle(content.getFullText());
        ctx.setTitle(title != null ? title : "resource-" + task.getResourceId());

        return ctx;
    }

    private String extractTitle(String text) {
        if (text == null || text.isEmpty()) return null;
        String firstLine = text.split("\n")[0].trim();
        if (firstLine.startsWith("#")) return firstLine.replaceAll("^#+\\s*", "");
        return firstLine.length() > 100 ? firstLine.substring(0, 100) : firstLine;
    }

    private KnowledgeGraphScope buildScope(AiMountTask task) {
        List<KnowledgePoint> allKps = knowledgePointMapper.selectList(null);
        Map<String, List<KnowledgeNode>> nodesByType = new LinkedHashMap<>();

        for (KnowledgePoint kp : allKps) {
            String type = kp.getNodeType() != null ? kp.getNodeType() : "knowledge_point";
            KnowledgeNode node = new KnowledgeNode(
                    kp.getId(), kp.getName(), type,
                    kp.getNodeLevel() != null ? kp.getNodeLevel() : 3,
                    kp.getParentId(), kp.getCourse(), kp.getChapter(),
                    kp.getDescription() != null ? kp.getDescription() : "",
                    kp.getKeywords() != null ? kp.getKeywords() : "",
                    kp.getDifficulty() != null ? kp.getDifficulty() : "",
                    kp.getBloomLevel()
            );
            nodesByType.computeIfAbsent(type, k -> new ArrayList<>()).add(node);
        }

        // Synthetic course nodes
        Set<String> courses = allKps.stream()
                .map(KnowledgePoint::getCourse)
                .filter(c -> c != null && !c.isEmpty())
                .collect(Collectors.toSet());
        long id = 100000;
        for (String c : courses) {
            boolean dup = nodesByType.getOrDefault("course", List.of()).stream()
                    .anyMatch(n -> n.name().equals(c));
            if (!dup) {
                nodesByType.computeIfAbsent("course", k -> new ArrayList<>())
                        .add(new KnowledgeNode(id++, c, "course", 1, null,
                                c, "", "", "", "", null));
            }
        }

        return new KnowledgeGraphScope(nodesByType);
    }

    private Long createMountRelation(AiMountTask task, MountDecision decision, String source) {
        ResourceMountRelation rel = ResourceMountRelation.builder()
                .resourceType(task.getResourceType())
                .resourceId(task.getResourceId())
                .resourceTitle("")
                .knowledgeNodeId(decision.getNodeId())
                .knowledgeNodeType(decision.getNodeType())
                .knowledgeNodeName(decision.getNodeName())
                .mountPath(decision.getMountPath())
                .mountSource(source)
                .confidence(decision.getConfidenceDecimal())
                .status("ai_auto".equals(source) ? "active" : "active")
                .mountedBy("AI+" + decision.getTopStrategy())
                .mountedAt(LocalDateTime.now())
                .deleted(0)
                .build();
        try {
            mountRelationMapper.insert(rel);
            return rel.getId();
        } catch (org.springframework.dao.DuplicateKeyException e) {
            log.debug("Mount relation already exists: {}-{}-{}",
                    task.getResourceType(), task.getResourceId(), decision.getNodeId());
            return null;
        }
    }

    private void createReviewRecord(AiMountTask task, MountDecision decision, Long mountRelationId) {
        MountReviewRecord record = MountReviewRecord.builder()
                .taskId(task.getId())
                .mountRelationId(mountRelationId)
                .originalNodeId(decision.getNodeId())
                .originalNodeName(decision.getNodeName())
                .aiConfidence(decision.getConfidenceDecimal())
                .reviewAction("pending")
                .reviewedBy("")
                .reviewedAt(LocalDateTime.now())
                .feedbackUsed(0)
                .deleted(0)
                .build();
        reviewRecordMapper.insert(record);
    }
}
