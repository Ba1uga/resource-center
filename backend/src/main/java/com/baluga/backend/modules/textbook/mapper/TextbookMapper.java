package com.baluga.backend.modules.textbook.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baluga.backend.modules.textbook.entity.Textbook;
import org.apache.ibatis.annotations.Mapper;


@Mapper
public interface TextbookMapper extends BaseMapper<Textbook> {
}
