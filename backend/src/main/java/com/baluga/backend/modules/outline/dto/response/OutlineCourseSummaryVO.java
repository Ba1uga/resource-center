package com.baluga.backend.modules.outline.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OutlineCourseSummaryVO {

    private Long id;

    private String title;

    private String instructor;

    private String department;

    private Integer matchedVersionCount;

    private Integer totalVersionCount;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Shanghai")
    private LocalDateTime latestMatchedVersionUpdatedAt;
}
