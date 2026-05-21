package com.baluga.backend.modules.mapping.dto.response;

import com.baluga.backend.modules.mapping.entity.MappingRecord;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MappingRecordVO {

    private Long id;
    private String resourceTitle;
    private String resourceType;
    private String courseName;
    private String chapterName;
    private Long batchId;
    private String batchLabel;
    private String reviewStatus;
    private String confidenceLevel;
    private String primaryKnowledgePoint;
    private Long selectedCandidateId;
    private List<MappingCandidateVO> candidates;
}
