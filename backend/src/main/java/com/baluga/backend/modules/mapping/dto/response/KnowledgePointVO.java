package com.baluga.backend.modules.mapping.dto.response;

import com.baluga.backend.modules.mapping.entity.KnowledgePoint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KnowledgePointVO {

    private Long id;
    private String name;
    private String course;
    private String chapter;
    private String description;

    public static KnowledgePointVO fromEntity(KnowledgePoint entity) {
        return KnowledgePointVO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .course(entity.getCourse())
                .chapter(entity.getChapter())
                .description(entity.getDescription())
                .build();
    }
}
