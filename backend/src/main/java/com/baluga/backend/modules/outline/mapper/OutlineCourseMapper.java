package com.baluga.backend.modules.outline.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baluga.backend.modules.outline.dto.request.OutlineListRequest;
import com.baluga.backend.modules.outline.dto.response.OutlineCourseSummaryVO;
import com.baluga.backend.modules.outline.entity.OutlineCourse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;


@Mapper
public interface OutlineCourseMapper extends BaseMapper<OutlineCourse> {

    Page<OutlineCourseSummaryVO> selectCourseSummaryPage(
            Page<OutlineCourseSummaryVO> page,
            @Param("request") OutlineListRequest request,
            @Param("versionFilterActive") boolean versionFilterActive
    );
}
