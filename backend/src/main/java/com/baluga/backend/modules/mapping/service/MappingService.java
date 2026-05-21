package com.baluga.backend.modules.mapping.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.baluga.backend.modules.mapping.dto.request.MappingBatchCreateRequest;
import com.baluga.backend.modules.mapping.dto.request.MappingRecordPageRequest;
import com.baluga.backend.modules.mapping.dto.response.KnowledgePointVO;
import com.baluga.backend.modules.mapping.dto.response.MappingBatchVO;
import com.baluga.backend.modules.mapping.dto.response.MappingFilterOptionsVO;
import com.baluga.backend.modules.mapping.dto.response.MappingRecordVO;
import com.baluga.backend.modules.mapping.dto.response.MappingSummaryVO;
import com.baluga.backend.modules.mapping.entity.MappingRecord;

import java.util.Map;


public interface MappingService extends IService<MappingRecord> {

    Page<MappingRecordVO> pageRecords(MappingRecordPageRequest request);

    MappingRecordVO getRecordDetail(Long id);

    MappingRecordVO reviewRecord(Long id, String action);

    MappingRecordVO selectCandidate(Long recordId, Long candidateId);

    MappingBatchVO createBatch(MappingBatchCreateRequest request);

    MappingBatchVO runBatch(Long batchId);

    MappingSummaryVO getSummary(MappingRecordPageRequest request);

    MappingFilterOptionsVO getFilterOptions();

    Page<KnowledgePointVO> pageKnowledgePoints(String keyword, String course, Integer page, Integer pageSize);

    Page<MappingBatchVO> pageBatches(String keyword, Integer page, Integer pageSize);

    Map<String, Long> batchRemap(Long batchId);
}
