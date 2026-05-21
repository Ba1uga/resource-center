package com.baluga.backend.modules.mapping.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MappingSummaryVO {

    private int pendingCount;
    private int matchedCount;
    private int manualReviewCount;
    private int confirmedCount;
    private int failedCount;
    private int lowConfidenceCount;
}
