package com.baluga.backend.modules.outline.dto.response;

import com.baluga.backend.modules.outline.entity.OutlineCourse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OutlineCourseVO {

    private Long id;

    private String title;

    private String instructor;

    private String department;

    private Integer versionCount;

    private List<OutlineVersionVO> versions;

    public static OutlineCourseVO fromEntity(OutlineCourse course, List<OutlineVersionVO> versions) {
        return OutlineCourseVO.builder()
                .id(course.getId())
                .title(course.getTitle())
                .instructor(course.getInstructor())
                .department(course.getDepartment())
                .versionCount(versions.size())
                .versions(versions)
                .build();
    }
}
