package com.baluga.backend.modules.mapping.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MappingFilterOptionsVO {

    private List<SelectOption> resourceTypeOptions;
    private List<SelectOption> courseOptions;
    private List<SelectOption> chapterOptions;
    private List<SelectOption> batchOptions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SelectOption {
        private String value;
        private String label;
    }
}
