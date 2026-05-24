package com.baluga.backend.modules.mapping.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baluga.backend.infrastructure.integration.ai.AiMatchingConfig;
import com.baluga.backend.infrastructure.integration.ai.AiMatchingProvider;
import com.baluga.backend.infrastructure.integration.ai.AiMatchingProvider.KnowledgePointInfo;
import com.baluga.backend.infrastructure.integration.ai.AiMatchingProvider.KnowledgePointMatch;
import com.baluga.backend.infrastructure.integration.ai.AiMatchingProvider.ResourceInfo;
import com.baluga.backend.infrastructure.integration.ai.AiMatchingProvider.ResourceMatchRequest;
import com.baluga.backend.infrastructure.integration.ai.AiMatchingProvider.ResourceMatchResponse;
import com.baluga.backend.infrastructure.integration.ai.KeywordFallbackMatchingProvider;
import com.baluga.backend.infrastructure.integration.ai.OpenAiCompatibleMatchingProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.baluga.backend.modules.mapping.entity.KnowledgePoint;
import com.baluga.backend.modules.mapping.entity.MappingBatch;
import com.baluga.backend.modules.mapping.entity.MappingCandidate;
import com.baluga.backend.modules.mapping.entity.MappingRecord;
import com.baluga.backend.modules.mapping.mapper.KnowledgePointMapper;
import com.baluga.backend.modules.mapping.mapper.MappingBatchMapper;
import com.baluga.backend.modules.mapping.mapper.MappingCandidateMapper;
import com.baluga.backend.modules.mapping.mapper.MappingRecordMapper;
import com.baluga.backend.modules.mapping.service.ResourceParseService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;


@Component
public class MappingBatchExecutor {

    private static final Logger log = LoggerFactory.getLogger(MappingBatchExecutor.class);

    private final MappingRecordMapper mappingRecordMapper;
    private final MappingCandidateMapper mappingCandidateMapper;
    private final MappingBatchMapper mappingBatchMapper;
    private final KnowledgePointMapper knowledgePointMapper;
    private final ResourceParseService resourceParseService;
    private final AiMatchingProvider aiMatchingProvider;

    public MappingBatchExecutor(
            MappingRecordMapper mappingRecordMapper,
            MappingCandidateMapper mappingCandidateMapper,
            MappingBatchMapper mappingBatchMapper,
            KnowledgePointMapper knowledgePointMapper,
            ResourceParseService resourceParseService,
            AiMatchingConfig aiConfig,
            ObjectMapper objectMapper) {
        this.mappingRecordMapper = mappingRecordMapper;
        this.mappingCandidateMapper = mappingCandidateMapper;
        this.mappingBatchMapper = mappingBatchMapper;
        this.knowledgePointMapper = knowledgePointMapper;
        this.resourceParseService = resourceParseService;
        this.aiMatchingProvider = resolveProvider(aiConfig, objectMapper);
    }

    private static AiMatchingProvider resolveProvider(AiMatchingConfig config, ObjectMapper mapper) {
        boolean isOpenAi = "openai".equalsIgnoreCase(config.getProvider());
        boolean hasKey = config.getOpenaiApiKey() != null && !config.getOpenaiApiKey().isBlank();
        if (isOpenAi && hasKey) {
            return new OpenAiCompatibleMatchingProvider(config, mapper);
        }
        return new KeywordFallbackMatchingProvider();
    }

    @Async
    public void executeAsync(MappingBatch batch) {
        try {
            runBatch(batch);
        } catch (Exception e) {
            log.error("Batch {} async execution failed", batch.getId(), e);
            batch.setStatus("failed");
            batch.setCompletedAt(LocalDateTime.now());
            mappingBatchMapper.updateById(batch);
        }
    }

    private void runBatch(MappingBatch batch) {
        batch.setStatus("processing");
        batch.setStartedAt(LocalDateTime.now());
        mappingBatchMapper.updateById(batch);

        LambdaQueryWrapper<MappingRecord> recordWrapper = Wrappers.lambdaQuery();
        recordWrapper.eq(MappingRecord::getBatchId, batch.getId());
        List<MappingRecord> records = mappingRecordMapper.selectList(recordWrapper);

        if (records.isEmpty()) {
            batch.setStatus("completed");
            batch.setCompletedAt(LocalDateTime.now());
            mappingBatchMapper.updateById(batch);
            return;
        }

        LambdaQueryWrapper<KnowledgePoint> kpWrapper = Wrappers.lambdaQuery();
        if (StringUtils.hasText(batch.getCourseFilter())) {
            kpWrapper.eq(KnowledgePoint::getCourse, batch.getCourseFilter());
        }
        List<KnowledgePoint> knowledgePoints = knowledgePointMapper.selectList(kpWrapper);

        log.info("Batch {}: collected {} resources and {} knowledge points",
                batch.getId(), records.size(), knowledgePoints.size());

        if (knowledgePoints.isEmpty()) {
            log.warn("Batch {}: no knowledge points found", batch.getId());
            batch.setStatus("failed");
            batch.setCompletedAt(LocalDateTime.now());
            mappingBatchMapper.updateById(batch);
            return;
        }

        // Build AI request with parsed content snippets
        List<ResourceInfo> resourceInfos = new ArrayList<>();
        for (int i = 0; i < records.size(); i++) {
            MappingRecord r = records.get(i);
            String contentSnippet = "";
            try {
                var content = resourceParseService.getOrParse(r.getResourceType(), r.getResourceId());
                if (content != null && content.getFullText() != null) {
                    contentSnippet = content.getFullText().length() > 500
                            ? content.getFullText().substring(0, 500)
                            : content.getFullText();
                }
            } catch (Exception ignored) {
                // best-effort
            }
            resourceInfos.add(new ResourceInfo(
                    i, r.getResourceId(), r.getResourceTitle(), r.getResourceType(),
                    r.getCourseName(), r.getChapterName(), contentSnippet
            ));
        }

        List<KnowledgePointInfo> kpInfos = new ArrayList<>();
        for (int i = 0; i < knowledgePoints.size(); i++) {
            KnowledgePoint kp = knowledgePoints.get(i);
            kpInfos.add(new KnowledgePointInfo(
                    i, kp.getId(), kp.getName(),
                    kp.getCourse(), kp.getChapter(), kp.getDescription()
            ));
        }

        ResourceMatchRequest aiRequest = new ResourceMatchRequest(resourceInfos, kpInfos, 3);
        log.info("Batch {}: calling AI provider for matching", batch.getId());
        List<ResourceMatchResponse> responses = aiMatchingProvider.match(aiRequest);
        log.info("Batch {}: AI returned {} responses", batch.getId(), responses.size());

        int matchedCount = 0;
        int failedCount = 0;

        for (ResourceMatchResponse resp : responses) {
            if (resp.resourceIndex() < 0 || resp.resourceIndex() >= records.size()) continue;
            MappingRecord record = records.get(resp.resourceIndex());
            List<KnowledgePointMatch> matches = resp.matches();

            if (matches.isEmpty()) { failedCount++; continue; }

            String topConfidence = resolveTopConfidence(matches);
            record.setConfidenceLevel(topConfidence);
            matchedCount++;

            for (KnowledgePointMatch match : matches) {
                String confidence = match.confidence() != null ? match.confidence() : "low";
                Long kpId = null;
                String kpName = "";
                if (match.knowledgePointIndex() >= 0 && match.knowledgePointIndex() < knowledgePoints.size()) {
                    KnowledgePoint kp = knowledgePoints.get(match.knowledgePointIndex());
                    kpName = kp.getName();
                    kpId = kp.getId();
                }
                MappingCandidate candidate = MappingCandidate.builder()
                        .mappingRecordId(record.getId())
                        .knowledgePointId(kpId != null ? kpId : 0L)
                        .knowledgePointName(kpName)
                        .confidenceLevel(confidence)
                        .matchedBy("ai")
                        .note(match.reasoning() != null ? match.reasoning() : "")
                        .deleted(0)
                        .build();
                mappingCandidateMapper.insert(candidate);

                if (record.getSelectedCandidateId() == null && "high".equals(confidence)) {
                    record.setSelectedCandidateId(candidate.getId());
                    record.setPrimaryKnowledgePointId(kpId);
                }
            }

            if (record.getSelectedCandidateId() == null && !matches.isEmpty()) {
                LambdaQueryWrapper<MappingCandidate> cw = Wrappers.lambdaQuery();
                cw.eq(MappingCandidate::getMappingRecordId, record.getId())
                  .orderByAsc(MappingCandidate::getId);
                List<MappingCandidate> candidates = mappingCandidateMapper.selectList(cw);
                if (!candidates.isEmpty()) {
                    record.setSelectedCandidateId(candidates.get(0).getId());
                    record.setPrimaryKnowledgePointId(candidates.get(0).getKnowledgePointId());
                }
            }
            mappingRecordMapper.updateById(record);
        }

        Set<Integer> matchedIndices = responses.stream()
                .map(ResourceMatchResponse::resourceIndex).collect(Collectors.toSet());
        for (int i = 0; i < records.size(); i++) {
            if (!matchedIndices.contains(i)) failedCount++;
        }

        batch.setMatchedCount(matchedCount);
        batch.setFailedCount(failedCount);
        batch.setStatus("completed");
        batch.setCompletedAt(LocalDateTime.now());
        mappingBatchMapper.updateById(batch);
    }

    private String resolveTopConfidence(List<KnowledgePointMatch> matches) {
        for (KnowledgePointMatch m : matches) if ("high".equals(m.confidence())) return "high";
        for (KnowledgePointMatch m : matches) if ("medium".equals(m.confidence())) return "medium";
        return "low";
    }
}
