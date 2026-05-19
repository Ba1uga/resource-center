package com.baluga.backend.modules.outline.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baluga.backend.modules.outline.dto.request.OutlineListRequest;
import com.baluga.backend.modules.outline.dto.response.OutlineVersionSummaryVO;
import com.baluga.backend.modules.outline.entity.OutlineVersion;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;


@Mapper
public interface OutlineVersionMapper extends BaseMapper<OutlineVersion> {

    Page<OutlineVersionSummaryVO> selectCourseVersionSummaryPage(
            Page<OutlineVersionSummaryVO> page,
            @Param("courseId") Long courseId,
            @Param("keyword") String keyword,
            @Param("request") OutlineListRequest request
    );
}
