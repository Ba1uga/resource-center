package com.baluga.backend.modules.mapping.dto.response;

import com.baluga.backend.modules.mapping.entity.MappingBatch;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MappingBatchVO {

    private Long id;
    private String label;
    private String status;
    private Integer totalResources;
    private Integer matchedCount;
    private Integer failedCount;
    private String createdBy;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;

    public static MappingBatchVO fromEntity(MappingBatch entity) {
        return MappingBatchVO.builder()
                .id(entity.getId())
                .label(entity.getLabel())
                .status(entity.getStatus())
                .totalResources(entity.getTotalResources())
                .matchedCount(entity.getMatchedCount())
                .failedCount(entity.getFailedCount())
                .createdBy(entity.getCreatedBy())
                .startedAt(entity.getStartedAt())
                .completedAt(entity.getCompletedAt())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
