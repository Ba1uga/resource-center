package com.baluga.backend.modules.question.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.baluga.backend.modules.question.dto.request.QuestionCreateRequest;
import com.baluga.backend.modules.question.dto.request.QuestionUpdateRequest;
import com.baluga.backend.modules.question.entity.Question;


public interface QuestionService extends IService<Question> {

    Page<Question> pageQuestions(String subjectId, String chapterId, String type, String difficulty, String keyword, Integer page, Integer pageSize);

    Question createQuestion(QuestionCreateRequest request);

    Question updateQuestion(Long id, QuestionUpdateRequest request);
}