package com.baluga.backend.modules.video.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baluga.backend.modules.video.entity.Video;
import org.apache.ibatis.annotations.Mapper;


@Mapper
public interface VideoMapper extends BaseMapper<Video> {
}