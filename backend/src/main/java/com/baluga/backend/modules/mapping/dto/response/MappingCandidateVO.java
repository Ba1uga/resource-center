package com.baluga.backend.modules.mapping.dto.response;

import com.baluga.backend.modules.mapping.entity.MappingCandidate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MappingCandidateVO {

    private Long id;
    private String knowledgePointName;
    private String confidenceLevel;
    private String matchedBy;
    private String note;

    public static MappingCandidateVO fromEntity(MappingCandidate entity) {
        return MappingCandidateVO.builder()
                .id(entity.getId())
                .knowledgePointName(entity.getKnowledgePointName())
                .confidenceLevel(entity.getConfidenceLevel())
                .matchedBy(entity.getMatchedBy())
                .note(entity.getNote())
                .build();
    }
}
