package com.baluga.backend.modules.mapping.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.baluga.backend.infrastructure.integration.ai.AiMatchingConfig;
import com.baluga.backend.infrastructure.integration.ai.AiMatchingProvider;
import com.baluga.backend.infrastructure.integration.ai.AiMatchingProvider.KnowledgePointInfo;
import com.baluga.backend.infrastructure.integration.ai.AiMatchingProvider.KnowledgePointMatch;
import com.baluga.backend.infrastructure.integration.ai.AiMatchingProvider.ResourceInfo;
import com.baluga.backend.infrastructure.integration.ai.AiMatchingProvider.ResourceMatchRequest;
import com.baluga.backend.infrastructure.integration.ai.AiMatchingProvider.ResourceMatchResponse;
import com.baluga.backend.infrastructure.integration.ai.KeywordFallbackMatchingProvider;
import com.baluga.backend.infrastructure.integration.ai.OpenAiCompatibleMatchingProvider;
import com.baluga.backend.infrastructure.integration.matching.ResourceCollector;
import com.baluga.backend.modules.mapping.dto.request.MappingBatchCreateRequest;
import com.baluga.backend.modules.mapping.dto.request.MappingRecordPageRequest;
import com.baluga.backend.modules.mapping.dto.response.KnowledgePointVO;
import com.baluga.backend.modules.mapping.dto.response.MappingBatchVO;
import com.baluga.backend.modules.mapping.dto.response.MappingCandidateVO;
import com.baluga.backend.modules.mapping.dto.response.MappingFilterOptionsVO;
import com.baluga.backend.modules.mapping.dto.response.MappingFilterOptionsVO.SelectOption;
import com.baluga.backend.modules.mapping.dto.response.MappingRecordVO;
import com.baluga.backend.modules.mapping.dto.response.MappingSummaryVO;
import com.baluga.backend.modules.mapping.entity.KnowledgePoint;
import com.baluga.backend.modules.mapping.entity.MappingBatch;
import com.baluga.backend.modules.mapping.entity.MappingCandidate;
import com.baluga.backend.modules.mapping.entity.MappingRecord;
import com.baluga.backend.modules.mapping.mapper.KnowledgePointMapper;
import com.baluga.backend.modules.mapping.mapper.MappingBatchMapper;
import com.baluga.backend.modules.mapping.mapper.MappingCandidateMapper;
import com.baluga.backend.modules.mapping.mapper.MappingRecordMapper;
import com.baluga.backend.modules.mapping.service.MappingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;


@Service
public class MappingServiceImpl extends ServiceImpl<MappingRecordMapper, MappingRecord> implements MappingService {

    private static final Logger log = LoggerFactory.getLogger(MappingServiceImpl.class);

    private final MappingRecordMapper mappingRecordMapper;
    private final MappingCandidateMapper mappingCandidateMapper;
    private final MappingBatchMapper mappingBatchMapper;
    private final KnowledgePointMapper knowledgePointMapper;
    private final ResourceCollector resourceCollector;
    private final ObjectMapper objectMapper;
    private final AiMatchingProvider aiProvider;

    public MappingServiceImpl(
            MappingRecordMapper mappingRecordMapper,
            MappingCandidateMapper mappingCandidateMapper,
            MappingBatchMapper mappingBatchMapper,
            KnowledgePointMapper knowledgePointMapper,
            ResourceCollector resourceCollector,
            ObjectMapper objectMapper,
            AiMatchingConfig aiConfig) {
        this.mappingRecordMapper = mappingRecordMapper;
        this.mappingCandidateMapper = mappingCandidateMapper;
        this.mappingBatchMapper = mappingBatchMapper;
        this.knowledgePointMapper = knowledgePointMapper;
        this.resourceCollector = resourceCollector;
        this.objectMapper = objectMapper;

        // Diagnostic: print actual config values at startup
        log.info("AI Matching Config — provider: '{}'", aiConfig.getProvider());
        log.info("AI Matching Config — base-url: '{}'", aiConfig.getOpenaiBaseUrl());
        log.info("AI Matching Config — model: '{}'", aiConfig.getOpenaiModel());
        String keyPreview = aiConfig.getOpenaiApiKey();
        if (keyPreview != null && !keyPreview.isEmpty()) {
            log.info("AI Matching Config — api-key: '{}...{}' (length={})",
                    keyPreview.substring(0, Math.min(8, keyPreview.length())),
                    keyPreview.substring(Math.max(0, keyPreview.length() - 4)),
                    keyPreview.length());
        } else {
            log.info("AI Matching Config — api-key: <EMPTY or NULL>");
        }

        // Select AI provider based on config
        boolean isOpenAi = "openai".equalsIgnoreCase(aiConfig.getProvider());
        boolean hasKey = aiConfig.getOpenaiApiKey() != null && !aiConfig.getOpenaiApiKey().isBlank();
        log.info("AI Matching — provider='{}' isOpenAi={} hasKey={}", aiConfig.getProvider(), isOpenAi, hasKey);

        if (isOpenAi && hasKey) {
            this.aiProvider = new OpenAiCompatibleMatchingProvider(aiConfig, objectMapper);
        } else {
            this.aiProvider = new KeywordFallbackMatchingProvider();
            if (isOpenAi && !hasKey) {
                log.warn("AI Matching — provider is 'openai' but API key is empty. "
                        + "Set DEEPSEEK_API_KEY environment variable or configure openai-api-key in yml.");
            }
        }
        log.info("Mapping service using AI provider: {}", this.aiProvider.getProviderName());
    }

    // ========== Query ==========

    @Override
    public Page<MappingRecordVO> pageRecords(MappingRecordPageRequest request) {
        LambdaQueryWrapper<MappingRecord> wrapper = buildRecordQueryWrapper(request);

        int pageNum = request.getPage() != null && request.getPage() > 0 ? request.getPage() : 1;
        int pageSize = request.getPageSize() != null && request.getPageSize() > 0 ? request.getPageSize() : 10;
        Page<MappingRecord> page = mappingRecordMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);

        List<MappingRecordVO> voList = page.getRecords().stream()
                .map(this::toRecordVO)
                .collect(Collectors.toList());

        Page<MappingRecordVO> result = new Page<>(page.getCurrent(), page.getSize(), page.getTotal());
        result.setRecords(voList);
        return result;
    }

    @Override
    public MappingRecordVO getRecordDetail(Long id) {
        MappingRecord record = mappingRecordMapper.selectById(id);
        if (record == null) {
            return null;
        }
        return toRecordVO(record);
    }

    // ========== Mutations ==========

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MappingRecordVO reviewRecord(Long id, String action) {
        MappingRecord record = mappingRecordMapper.selectById(id);
        if (record == null) {
            throw new IllegalArgumentException("映射记录不存在");
        }

        if ("approve".equals(action)) {
            record.setReviewStatus("approved");
            // persist the selected candidate as primary
            if (record.getSelectedCandidateId() != null) {
                MappingCandidate candidate = mappingCandidateMapper.selectById(record.getSelectedCandidateId());
                if (candidate != null) {
                    record.setPrimaryKnowledgePointId(candidate.getKnowledgePointId());
                }
            }
        } else {
            record.setReviewStatus("rejected");
            record.setSelectedCandidateId(null);
            record.setPrimaryKnowledgePointId(null);
        }

        mappingRecordMapper.updateById(record);
        return toRecordVO(record);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MappingRecordVO selectCandidate(Long recordId, Long candidateId) {
        MappingRecord record = mappingRecordMapper.selectById(recordId);
        if (record == null) {
            throw new IllegalArgumentException("映射记录不存在");
        }

        record.setSelectedCandidateId(candidateId);

        if (candidateId != null) {
            MappingCandidate candidate = mappingCandidateMapper.selectById(candidateId);
            if (candidate != null) {
                record.setPrimaryKnowledgePointId(candidate.getKnowledgePointId());
            }
        } else {
            record.setPrimaryKnowledgePointId(null);
        }

        mappingRecordMapper.updateById(record);
        return toRecordVO(record);
    }

    // ========== Batch ==========

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MappingBatchVO createBatch(MappingBatchCreateRequest request) {
        MappingBatch batch = MappingBatch.builder()
                .label(normalize(request.getLabel()))
                .status("pending")
                .courseFilter(normalize(request.getCourse()))
                .totalResources(0)
                .matchedCount(0)
                .failedCount(0)
                .createdBy(normalize(request.getCreatedBy()))
                .deleted(0)
                .build();
        mappingBatchMapper.insert(batch);

        List<ResourceInfo> resources = resourceCollector.collectResources(
                request.getCourse(), request.getResourceType());

        for (ResourceInfo ri : resources) {
            MappingRecord record = MappingRecord.builder()
                    .batchId(batch.getId())
                    .resourceType(ri.type())
                    .resourceId(ri.resourceId())
                    .resourceTitle(ri.title())
                    .courseName(ri.course())
                    .chapterName(ri.chapter())
                    .reviewStatus("pending")
                    .confidenceLevel("low")
                    .deleted(0)
                    .build();
            mappingRecordMapper.insert(record);
        }

        batch.setTotalResources(resources.size());
        mappingBatchMapper.updateById(batch);

        return MappingBatchVO.fromEntity(batch);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MappingBatchVO runBatch(Long batchId) {
        MappingBatch batch = mappingBatchMapper.selectById(batchId);
        if (batch == null) {
            throw new IllegalArgumentException("批次不存在");
        }

        batch.setStatus("processing");
        batch.setStartedAt(LocalDateTime.now());
        mappingBatchMapper.updateById(batch);

        try {
            // Collect mapping records for this batch
            LambdaQueryWrapper<MappingRecord> recordWrapper = Wrappers.lambdaQuery();
            recordWrapper.eq(MappingRecord::getBatchId, batchId);
            List<MappingRecord> records = mappingRecordMapper.selectList(recordWrapper);

            if (records.isEmpty()) {
                batch.setStatus("completed");
                batch.setCompletedAt(LocalDateTime.now());
                mappingBatchMapper.updateById(batch);
                log.info("Batch {} has no records to match", batchId);
                return MappingBatchVO.fromEntity(batch);
            }

            // Collect knowledge points
            LambdaQueryWrapper<KnowledgePoint> kpWrapper = Wrappers.lambdaQuery();
            if (StringUtils.hasText(batch.getCourseFilter())) {
                kpWrapper.eq(KnowledgePoint::getCourse, batch.getCourseFilter());
            }
            List<KnowledgePoint> knowledgePoints = knowledgePointMapper.selectList(kpWrapper);

            log.info("Batch {}: collected {} resources and {} knowledge points", batchId, records.size(), knowledgePoints.size());

            if (knowledgePoints.isEmpty()) {
                log.warn("Batch {}: no knowledge points found, cannot perform AI matching", batchId);
                batch.setStatus("failed");
                batch.setCompletedAt(LocalDateTime.now());
                mappingBatchMapper.updateById(batch);
                return MappingBatchVO.fromEntity(batch);
            }

            // Build AI request
            List<ResourceInfo> resourceInfos = new ArrayList<>();
            for (int i = 0; i < records.size(); i++) {
                MappingRecord r = records.get(i);
                resourceInfos.add(new ResourceInfo(
                        i, r.getResourceId(), r.getResourceTitle(), r.getResourceType(),
                        r.getCourseName(), r.getChapterName(), ""
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

            ResourceMatchRequest aiRequest = new ResourceMatchRequest(
                    resourceInfos, kpInfos, 3
            );

            log.info("Batch {}: calling AI provider '{}' for matching", batchId, aiProvider.getProviderName());
            List<ResourceMatchResponse> responses = aiProvider.match(aiRequest);
            log.info("Batch {}: AI matching returned {} resource match responses", batchId, responses.size());

            int matchedCount = 0;
            int failedCount = 0;

            for (ResourceMatchResponse resp : responses) {
                if (resp.resourceIndex() < 0 || resp.resourceIndex() >= records.size()) {
                    continue;
                }

                MappingRecord record = records.get(resp.resourceIndex());
                List<KnowledgePointMatch> matches = resp.matches();

                if (matches.isEmpty()) {
                    failedCount++;
                    continue;
                }

                // Determine top confidence
                String topConfidence = resolveTopConfidence(matches);

                record.setConfidenceLevel(topConfidence);
                matchedCount++;

                // Create candidates
                for (KnowledgePointMatch match : matches) {
                    String confidence = match.confidence() != null ? match.confidence() : "low";
                    String kpName = "";
                    Long kpId = null;
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

                    // Auto-select the first high-confidence match
                    if (record.getSelectedCandidateId() == null && "high".equals(confidence)) {
                        record.setSelectedCandidateId(candidate.getId());
                        record.setPrimaryKnowledgePointId(kpId);
                    }
                }

                // Fallback: select first candidate if none selected
                if (record.getSelectedCandidateId() == null && matches.size() > 0) {
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

            // Mark records not returned by AI as failed
            Set<Integer> matchedIndices = responses.stream()
                    .map(ResourceMatchResponse::resourceIndex)
                    .collect(Collectors.toSet());
            for (int i = 0; i < records.size(); i++) {
                if (!matchedIndices.contains(i)) {
                    failedCount++;
                }
            }

            batch.setMatchedCount(matchedCount);
            batch.setFailedCount(failedCount);
            batch.setStatus("completed");
            batch.setCompletedAt(LocalDateTime.now());
            mappingBatchMapper.updateById(batch);

        } catch (Exception ex) {
            log.error("Batch AI matching failed: {}", ex.getMessage(), ex);
            batch.setStatus("failed");
            batch.setCompletedAt(LocalDateTime.now());
            mappingBatchMapper.updateById(batch);
        }

        return MappingBatchVO.fromEntity(batch);
    }

    @Override
    public Map<String, Long> batchRemap(Long batchId) {
        MappingBatch batch = mappingBatchMapper.selectById(batchId);
        if (batch == null) {
            throw new IllegalArgumentException("批次不存在");
        }

        // Reset failed records to pending
        LambdaQueryWrapper<MappingRecord> wrapper = Wrappers.lambdaQuery();
        wrapper.eq(MappingRecord::getBatchId, batchId)
               .eq(MappingRecord::getConfidenceLevel, "low");
        List<MappingRecord> lowRecords = mappingRecordMapper.selectList(wrapper);
        long count = 0;
        for (MappingRecord r : lowRecords) {
            r.setReviewStatus("pending");
            r.setConfidenceLevel("low");
            r.setSelectedCandidateId(null);
            r.setPrimaryKnowledgePointId(null);
            mappingRecordMapper.updateById(r);
            count++;
        }

        // Re-run matching
        runBatch(batchId);

        Map<String, Long> result = new HashMap<>();
        result.put("resetCount", count);
        return result;
    }

    // ========== Summary & Filters ==========

    @Override
    public MappingSummaryVO getSummary(MappingRecordPageRequest request) {
        // Query without overviewStatus filter
        LambdaQueryWrapper<MappingRecord> wrapper = buildBaseRecordQueryWrapper(request);
        List<MappingRecord> records = mappingRecordMapper.selectList(wrapper);

        int pendingCount = 0, matchedCount = 0, manualReviewCount = 0, confirmedCount = 0, failedCount = 0, lowConfidenceCount = 0;

        for (MappingRecord r : records) {
            String overview = resolveOverviewStatus(r);
            switch (overview) {
                case "pending": pendingCount++; break;
                case "matched": matchedCount++; break;
                case "manual-review": manualReviewCount++; break;
                case "confirmed": confirmedCount++; break;
                case "failed": failedCount++; break;
            }
            if ("low".equals(r.getConfidenceLevel())) {
                lowConfidenceCount++;
            }
        }

        return MappingSummaryVO.builder()
                .pendingCount(pendingCount)
                .matchedCount(matchedCount)
                .manualReviewCount(manualReviewCount)
                .confirmedCount(confirmedCount)
                .failedCount(failedCount)
                .lowConfidenceCount(lowConfidenceCount)
                .build();
    }

    @Override
    public MappingFilterOptionsVO getFilterOptions() {
        List<MappingRecord> allRecords = mappingRecordMapper.selectList(Wrappers.lambdaQuery(MappingRecord.class));
        List<MappingBatch> allBatches = mappingBatchMapper.selectList(
                Wrappers.<MappingBatch>lambdaQuery().orderByDesc(MappingBatch::getCreatedAt));

        Set<String> courses = new HashSet<>();
        Set<String> chapters = new HashSet<>();
        for (MappingRecord r : allRecords) {
            if (StringUtils.hasText(r.getCourseName())) courses.add(r.getCourseName());
            if (StringUtils.hasText(r.getChapterName())) chapters.add(r.getChapterName());
        }

        return MappingFilterOptionsVO.builder()
                .resourceTypeOptions(List.of(
                        SelectOption.builder().value("all").label("全部资源类型").build(),
                        SelectOption.builder().value("article").label("图文").build(),
                        SelectOption.builder().value("courseware").label("课件").build(),
                        SelectOption.builder().value("question").label("习题").build(),
                        SelectOption.builder().value("video").label("录屏").build(),
                        SelectOption.builder().value("excerpt").label("节选").build()
                ))
                .courseOptions(buildSelectOptions(courses, "全部课程"))
                .chapterOptions(buildSelectOptions(chapters, "全部章节"))
                .batchOptions(allBatches.stream()
                        .map(b -> SelectOption.builder().value(b.getId().toString()).label(b.getLabel()).build())
                        .collect(Collectors.toList()))
                .build();
    }

    @Override
    public Page<KnowledgePointVO> pageKnowledgePoints(String keyword, String course, Integer page, Integer pageSize) {
        LambdaQueryWrapper<KnowledgePoint> wrapper = Wrappers.lambdaQuery();
        String kw = normalize(keyword);
        if (StringUtils.hasText(kw)) {
            wrapper.like(KnowledgePoint::getName, kw);
        }
        String cs = normalize(course);
        if (StringUtils.hasText(cs)) {
            wrapper.eq(KnowledgePoint::getCourse, cs);
        }
        wrapper.orderByAsc(KnowledgePoint::getCourse).orderByAsc(KnowledgePoint::getName);

        int p = page != null && page > 0 ? page : 1;
        int ps = pageSize != null && pageSize > 0 ? pageSize : 20;
        Page<KnowledgePoint> kpPage = knowledgePointMapper.selectPage(new Page<>(p, ps), wrapper);

        Page<KnowledgePointVO> result = new Page<>(kpPage.getCurrent(), kpPage.getSize(), kpPage.getTotal());
        result.setRecords(kpPage.getRecords().stream().map(KnowledgePointVO::fromEntity).collect(Collectors.toList()));
        return result;
    }

    @Override
    public Page<MappingBatchVO> pageBatches(String keyword, Integer page, Integer pageSize) {
        LambdaQueryWrapper<MappingBatch> wrapper = Wrappers.lambdaQuery(MappingBatch.class);
        String kw = normalize(keyword);
        if (StringUtils.hasText(kw)) {
            wrapper.like(MappingBatch::getLabel, kw);
        }

        int p = page != null && page > 0 ? page : 1;
        int ps = pageSize != null && pageSize > 0 ? pageSize : 20;
        Page<MappingBatch> batchPage = mappingBatchMapper.selectPage(new Page<>(p, ps), wrapper);

        Page<MappingBatchVO> result = new Page<>(batchPage.getCurrent(), batchPage.getSize(), batchPage.getTotal());
        result.setRecords(batchPage.getRecords().stream().map(MappingBatchVO::fromEntity).collect(Collectors.toList()));
        return result;
    }

    // ========== Private Helpers ==========

    private MappingRecordVO toRecordVO(MappingRecord record) {
        // Get candidates
        LambdaQueryWrapper<MappingCandidate> cw = Wrappers.lambdaQuery();
        cw.eq(MappingCandidate::getMappingRecordId, record.getId())
          .orderByAsc(MappingCandidate::getId);
        List<MappingCandidate> candidates = mappingCandidateMapper.selectList(cw);
        List<MappingCandidateVO> candidateVOs = candidates.stream()
                .map(MappingCandidateVO::fromEntity)
                .collect(Collectors.toList());

        // Get batch label
        String batchLabel = "";
        if (record.getBatchId() != null) {
            MappingBatch batch = mappingBatchMapper.selectById(record.getBatchId());
            if (batch != null) {
                batchLabel = batch.getLabel();
            }
        }

        // Get primary knowledge point name
        String primaryKpName = null;
        if (record.getPrimaryKnowledgePointId() != null) {
            KnowledgePoint kp = knowledgePointMapper.selectById(record.getPrimaryKnowledgePointId());
            if (kp != null) {
                primaryKpName = kp.getName();
            }
        }

        return MappingRecordVO.builder()
                .id(record.getId())
                .resourceTitle(record.getResourceTitle())
                .resourceType(record.getResourceType())
                .courseName(record.getCourseName())
                .chapterName(record.getChapterName())
                .batchId(record.getBatchId())
                .batchLabel(batchLabel)
                .reviewStatus(record.getReviewStatus())
                .confidenceLevel(record.getConfidenceLevel())
                .primaryKnowledgePoint(primaryKpName)
                .selectedCandidateId(record.getSelectedCandidateId())
                .candidates(candidateVOs)
                .build();
    }

    private LambdaQueryWrapper<MappingRecord> buildRecordQueryWrapper(MappingRecordPageRequest request) {
        LambdaQueryWrapper<MappingRecord> wrapper = buildBaseRecordQueryWrapper(request);

        // Apply derived overviewStatus filter
        String overview = normalize(request.getOverviewStatus());
        if (StringUtils.hasText(overview)) {
            switch (overview) {
                case "failed":
                    wrapper.eq(MappingRecord::getReviewStatus, "rejected");
                    break;
                case "confirmed":
                    wrapper.eq(MappingRecord::getReviewStatus, "approved")
                           .isNotNull(MappingRecord::getSelectedCandidateId);
                    break;
                case "manual-review":
                    wrapper.eq(MappingRecord::getConfidenceLevel, "low")
                           .ne(MappingRecord::getReviewStatus, "rejected");
                    break;
                case "matched":
                    wrapper.isNotNull(MappingRecord::getSelectedCandidateId)
                           .ne(MappingRecord::getReviewStatus, "approved");
                    break;
                case "pending":
                    wrapper.eq(MappingRecord::getReviewStatus, "pending")
                           .isNull(MappingRecord::getSelectedCandidateId)
                           .ne(MappingRecord::getConfidenceLevel, "low");
                    break;
            }
        }

        return wrapper;
    }

    private LambdaQueryWrapper<MappingRecord> buildBaseRecordQueryWrapper(MappingRecordPageRequest request) {
        LambdaQueryWrapper<MappingRecord> wrapper = Wrappers.lambdaQuery();

        String keyword = normalize(request.getKeyword());
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(MappingRecord::getResourceTitle, keyword)
                    .or()
                    .like(MappingRecord::getCourseName, keyword)
                    .or()
                    .like(MappingRecord::getChapterName, keyword));
        }

        String resourceType = normalize(request.getResourceType());
        if (StringUtils.hasText(resourceType)) {
            wrapper.eq(MappingRecord::getResourceType, resourceType);
        }

        String course = normalize(request.getCourse());
        if (StringUtils.hasText(course)) {
            wrapper.eq(MappingRecord::getCourseName, course);
        }

        String chapter = normalize(request.getChapter());
        if (StringUtils.hasText(chapter)) {
            wrapper.eq(MappingRecord::getChapterName, chapter);
        }

        String batchId = normalize(request.getBatchId());
        if (StringUtils.hasText(batchId)) {
            try {
                wrapper.eq(MappingRecord::getBatchId, Long.parseLong(batchId));
            } catch (NumberFormatException ignored) {}
        }

        String reviewStatus = normalize(request.getReviewStatus());
        if (StringUtils.hasText(reviewStatus)) {
            wrapper.eq(MappingRecord::getReviewStatus, reviewStatus);
        }

        String confidenceLevel = normalize(request.getConfidenceLevel());
        if (StringUtils.hasText(confidenceLevel)) {
            wrapper.eq(MappingRecord::getConfidenceLevel, confidenceLevel);
        }

        wrapper.orderByDesc(MappingRecord::getUpdatedAt).orderByDesc(MappingRecord::getId);
        return wrapper;
    }

    private String resolveOverviewStatus(MappingRecord record) {
        if ("rejected".equals(record.getReviewStatus())) return "failed";
        if ("approved".equals(record.getReviewStatus()) && record.getSelectedCandidateId() != null) return "confirmed";
        if ("low".equals(record.getConfidenceLevel())) return "manual-review";
        if (record.getSelectedCandidateId() != null) return "matched";
        return "pending";
    }

    private String resolveTopConfidence(List<KnowledgePointMatch> matches) {
        for (KnowledgePointMatch m : matches) {
            if ("high".equals(m.confidence())) return "high";
        }
        for (KnowledgePointMatch m : matches) {
            if ("medium".equals(m.confidence())) return "medium";
        }
        return "low";
    }

    private List<SelectOption> buildSelectOptions(Set<String> values, String allLabel) {
        List<SelectOption> options = new ArrayList<>();
        options.add(SelectOption.builder().value("all").label(allLabel).build());
        for (String v : values.stream().sorted().collect(Collectors.toList())) {
            options.add(SelectOption.builder().value(v).label(v).build());
        }
        return options;
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }
}
