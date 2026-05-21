package com.baluga.backend.modules.question.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baluga.backend.modules.question.entity.Question;
import org.apache.ibatis.annotations.Mapper;


@Mapper
public interface QuestionMapper extends BaseMapper<Question> {
}