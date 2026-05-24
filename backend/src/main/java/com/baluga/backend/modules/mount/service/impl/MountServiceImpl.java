package com.baluga.backend.modules.mount.service.impl;

import com.baluga.backend.modules.mapping.entity.KnowledgePoint;
import com.baluga.backend.modules.mapping.entity.ResourceContent;
import com.baluga.backend.modules.mapping.mapper.KnowledgePointMapper;
import com.baluga.backend.modules.mapping.mapper.ResourceContentMapper;
import com.baluga.backend.modules.mapping.service.ResourceParseService;
import com.baluga.backend.modules.mount.dto.MountDecision;
import com.baluga.backend.modules.mount.dto.ResourceContext;
import com.baluga.backend.modules.mount.dto.request.MountPreviewRequest;
import com.baluga.backend.modules.mount.dto.response.MountPreviewVO;
import com.baluga.backend.modules.mount.engine.FusionMountEngine;
import com.baluga.backend.modules.mount.engine.KnowledgeGraphScope;
import com.baluga.backend.modules.mount.engine.KnowledgeGraphScope.KnowledgeNode;
import com.baluga.backend.modules.mount.service.MountService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;


@Service
public class MountServiceImpl implements MountService {

    private static final Logger log = LoggerFactory.getLogger(MountServiceImpl.class);

    private static final Set<String> RESOURCE_TITLE_MAP = Set.of(
            "textbook", "courseware", "question", "video"
    );

    private final FusionMountEngine fusionEngine;
    private final KnowledgePointMapper knowledgePointMapper;
    private final ResourceParseService resourceParseService;
    private final ResourceContentMapper resourceContentMapper;

    public MountServiceImpl(FusionMountEngine fusionEngine,
                            KnowledgePointMapper knowledgePointMapper,
                            ResourceParseService resourceParseService,
                            ResourceContentMapper resourceContentMapper) {
        this.fusionEngine = fusionEngine;
        this.knowledgePointMapper = knowledgePointMapper;
        this.resourceParseService = resourceParseService;
        this.resourceContentMapper = resourceContentMapper;
    }

    @Override
    public MountPreviewVO preview(MountPreviewRequest request) {
        // 1. Build ResourceContext
        ResourceContext ctx = buildResourceContext(request);

        // 2. Build KnowledgeGraphScope
        KnowledgeGraphScope scope = buildKnowledgeGraphScope(request.getCourse());

        // 3. Run fusion
        FusionMountEngine.MountResult result = fusionEngine.fuse(ctx, scope);

        // 4. Build response
        MountPreviewVO vo = new MountPreviewVO();
        vo.setResourceId(request.getResourceId());
        vo.setResourceType(request.getResourceType());
        vo.setResourceTitle(ctx.getTitle());
        vo.setCourseMatches(result.courseMatches());
        vo.setChapterMatches(result.chapterMatches());
        vo.setKnowledgePointMatches(result.knowledgePointMatches());

        // Determine overall confidence
        String overall = "low";
        if (!result.topDecisions().isEmpty()) {
            overall = result.topDecisions().get(0).confidenceLabel();
        }
        vo.setOverallConfidence(overall);

        // Build summary
        if (result.topDecisions().isEmpty()) {
            vo.setSummary("AI未能匹配到合适的挂载位置，建议人工检查资源内容。");
        } else {
            MountDecision top = result.topDecisions().get(0);
            String action = top.isAutoApprovable() ? "建议自动挂载"
                    : top.needsReview() ? "建议人工审核" : "置信度较低，仅供参考";
            vo.setSummary(String.format("%s → %s (%.0f%%, %s)",
                    ctx.getTitle(), top.getMountPath(),
                    top.getFusionScore() * 100, action));
        }

        return vo;
    }

    private ResourceContext buildResourceContext(MountPreviewRequest request) {
        ResourceContext ctx = new ResourceContext();
        ctx.setResourceId(request.getResourceId());
        ctx.setResourceType(request.getResourceType());

        // Try to parse content
        try {
            ResourceContent content = resourceParseService.getOrParse(
                    request.getResourceType(), request.getResourceId());
            if (content != null) {
                ctx.setFullText(content.getFullText());

                // Try to get title from content or from resource table
                String title = extractTitleFromContent(content.getFullText());
                ctx.setTitle(title != null ? title : "resource-" + request.getResourceId());
            }
        } catch (Exception e) {
            ctx.setTitle("resource-" + request.getResourceId());
        }

        // Pre-set course if provided
        if (request.getCourse() != null && !request.getCourse().isEmpty()) {
            ctx.setCourse(request.getCourse());
        }

        return ctx;
    }

    private String extractTitleFromContent(String text) {
        if (text == null || text.isEmpty()) return null;
        String firstLine = text.split("\n")[0].trim();
        if (firstLine.startsWith("#")) {
            return firstLine.replaceAll("^#+\\s*", "");
        }
        if (firstLine.length() <= 100) return firstLine;
        return firstLine.substring(0, 100);
    }

    private KnowledgeGraphScope buildKnowledgeGraphScope(String courseFilter) {
        List<KnowledgePoint> allKps = knowledgePointMapper.selectList(null);

        Map<String, List<KnowledgeNode>> nodesByType = new LinkedHashMap<>();
        nodesByType.put("course", new ArrayList<>());
        nodesByType.put("chapter", new ArrayList<>());
        nodesByType.put("section", new ArrayList<>());
        nodesByType.put("knowledge_point", new ArrayList<>());
        nodesByType.put("competency", new ArrayList<>());

        for (KnowledgePoint kp : allKps) {
            if (courseFilter != null && !courseFilter.isEmpty()
                    && !courseFilter.equals(kp.getCourse())) {
                continue;
            }

            String type = kp.getNodeType() != null ? kp.getNodeType() : "knowledge_point";
            KnowledgeNode node = new KnowledgeNode(
                    kp.getId(),
                    kp.getName(),
                    type,
                    kp.getNodeLevel() != null ? kp.getNodeLevel() : 3,
                    kp.getParentId(),
                    kp.getCourse(),
                    kp.getChapter(),
                    kp.getDescription() != null ? kp.getDescription() : "",
                    kp.getKeywords() != null ? kp.getKeywords() : "",
                    kp.getDifficulty() != null ? kp.getDifficulty() : "",
                    kp.getBloomLevel()
            );
            nodesByType.computeIfAbsent(type, k -> new ArrayList<>()).add(node);
        }

        // Also build course-level nodes from unique courses
        Set<String> uniqueCourses = allKps.stream()
                .map(KnowledgePoint::getCourse)
                .filter(c -> c != null && !c.isEmpty())
                .collect(Collectors.toSet());
        long courseId = 100000;
        for (String course : uniqueCourses) {
            boolean exists = nodesByType.get("course").stream()
                    .anyMatch(n -> n.name().equals(course));
            if (!exists) {
                nodesByType.get("course").add(new KnowledgeNode(
                        courseId++, course, "course", 1, null,
                        course, "", "", "", "", null
                ));
            }
        }

        return new KnowledgeGraphScope(nodesByType);
    }
}
