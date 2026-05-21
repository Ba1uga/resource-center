package com.baluga.backend.modules.mapping.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baluga.backend.common.api.R;
import com.baluga.backend.modules.mapping.dto.request.MappingBatchCreateRequest;
import com.baluga.backend.modules.mapping.dto.request.MappingRecordPageRequest;
import com.baluga.backend.modules.mapping.dto.request.MappingRecordReviewRequest;
import com.baluga.backend.modules.mapping.dto.request.MappingRecordSelectCandidateRequest;
import com.baluga.backend.modules.mapping.dto.response.KnowledgePointVO;
import com.baluga.backend.modules.mapping.dto.response.MappingBatchVO;
import com.baluga.backend.modules.mapping.dto.response.MappingFilterOptionsVO;
import com.baluga.backend.modules.mapping.dto.response.MappingRecordVO;
import com.baluga.backend.modules.mapping.dto.response.MappingSummaryVO;
import com.baluga.backend.modules.mapping.service.MappingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;


@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mapping")
public class MappingController {

    private final MappingService mappingService;

    // ===== Records =====

    @GetMapping("/records")
    public R<Page<MappingRecordVO>> listRecords(@Valid MappingRecordPageRequest request) {
        return R.ok(mappingService.pageRecords(request));
    }

    @GetMapping("/records/{id}")
    public R<?> getRecord(@PathVariable Long id) {
        MappingRecordVO vo = mappingService.getRecordDetail(id);
        if (vo == null) {
            return R.fail("映射记录不存在");
        }
        return R.ok(vo);
    }

    @PutMapping("/records/{id}/review")
    public R<?> reviewRecord(@PathVariable Long id, @Valid @RequestBody MappingRecordReviewRequest request) {
        try {
            MappingRecordVO vo = mappingService.reviewRecord(id, request.getAction());
            return R.ok(vo);
        } catch (IllegalArgumentException ex) {
            return R.fail(ex.getMessage());
        }
    }

    @PutMapping("/records/{id}/select-candidate")
    public R<?> selectCandidate(@PathVariable Long id, @Valid @RequestBody MappingRecordSelectCandidateRequest request) {
        try {
            MappingRecordVO vo = mappingService.selectCandidate(id, request.getCandidateId());
            return R.ok(vo);
        } catch (IllegalArgumentException ex) {
            return R.fail(ex.getMessage());
        }
    }

    // ===== Summary & Filters =====

    @GetMapping("/summary")
    public R<MappingSummaryVO> getSummary(@Valid MappingRecordPageRequest request) {
        return R.ok(mappingService.getSummary(request));
    }

    @GetMapping("/filters")
    public R<MappingFilterOptionsVO> getFilterOptions() {
        return R.ok(mappingService.getFilterOptions());
    }

    // ===== Knowledge Points =====

    @GetMapping("/knowledge-points")
    public R<Page<KnowledgePointVO>> listKnowledgePoints(
            @jakarta.validation.constraints.Min(1) Integer page,
            @jakarta.validation.constraints.Min(1) Integer pageSize,
            String keyword, String course) {
        return R.ok(mappingService.pageKnowledgePoints(keyword, course, page, pageSize));
    }

    // ===== Batches =====

    @GetMapping("/batches")
    public R<Page<MappingBatchVO>> listBatches(
            String keyword,
            @jakarta.validation.constraints.Min(1) Integer page,
            @jakarta.validation.constraints.Min(1) Integer pageSize) {
        return R.ok(mappingService.pageBatches(keyword, page, pageSize));
    }

    @PostMapping("/batches")
    public R<MappingBatchVO> createBatch(@Valid @RequestBody MappingBatchCreateRequest request) {
        return R.ok(mappingService.createBatch(request));
    }

    @PostMapping("/batches/{id}/run")
    public R<?> runBatch(@PathVariable Long id) {
        try {
            MappingBatchVO vo = mappingService.runBatch(id);
            return R.ok(vo);
        } catch (IllegalArgumentException ex) {
            return R.fail(ex.getMessage());
        }
    }

    @PostMapping("/batches/{id}/records/remap")
    public R<?> batchRemap(@PathVariable Long id) {
        try {
            Map<String, Long> result = mappingService.batchRemap(id);
            return R.ok(result);
        } catch (IllegalArgumentException ex) {
            return R.fail(ex.getMessage());
        }
    }
}
