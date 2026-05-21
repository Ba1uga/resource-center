package com.baluga.backend.modules.courseware.dto.response;

import com.baluga.backend.modules.courseware.entity.Courseware;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoursewareVO {

    private Long id;

    private String title;

    private String course;

    private String chapter;

    private String type;

    private String fileSize;

    private String uploadedBy;

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Shanghai")
    private LocalDate uploadedAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Shanghai")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Shanghai")
    private LocalDateTime updatedAt;

    public static CoursewareVO fromEntity(Courseware courseware) {
        return CoursewareVO.builder()
                .id(courseware.getId())
                .title(courseware.getTitle())
                .course(courseware.getCourse())
                .chapter(courseware.getChapter())
                .type(courseware.getType())
                .fileSize(courseware.getFileSize())
                .uploadedBy(courseware.getUploadedBy())
                .uploadedAt(courseware.getUploadedAt())
                .createdAt(courseware.getCreatedAt())
                .updatedAt(courseware.getUpdatedAt())
                .build();
    }
}