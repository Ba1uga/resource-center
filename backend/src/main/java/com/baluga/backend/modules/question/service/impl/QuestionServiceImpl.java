package com.baluga.backend.modules.question.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.baluga.backend.modules.question.dto.request.QuestionCreateRequest;
import com.baluga.backend.modules.question.dto.request.QuestionUpdateRequest;
import com.baluga.backend.modules.question.entity.Question;
import com.baluga.backend.modules.question.mapper.QuestionMapper;
import com.baluga.backend.modules.question.service.QuestionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;


@Service
@RequiredArgsConstructor
public class QuestionServiceImpl extends ServiceImpl<QuestionMapper, Question> implements QuestionService {

    private final ObjectMapper objectMapper;

    @Override
    public Page<Question> pageQuestions(String subjectId, String chapterId, String type, String difficulty, String keyword, Integer page, Integer pageSize) {
        long currentPage = page != null && page > 0 ? page : 1L;
        long currentPageSize = pageSize != null && pageSize > 0 ? pageSize : 10L;

        LambdaQueryWrapper<Question> queryWrapper = Wrappers.lambdaQuery();
        String normalizedSubjectId = subjectId != null ? subjectId.trim() : "";
        String normalizedChapterId = chapterId != null ? chapterId.trim() : "";
        String normalizedType = type != null ? type.trim() : "";
        String normalizedDifficulty = difficulty != null ? difficulty.trim() : "";
        String normalizedKeyword = keyword != null ? keyword.trim() : "";

        if (StringUtils.hasText(normalizedSubjectId)) {
            queryWrapper.eq(Question::getSubjectId, normalizedSubjectId);
        }

        if (StringUtils.hasText(normalizedChapterId)) {
            queryWrapper.eq(Question::getChapterId, normalizedChapterId);
        }

        if (StringUtils.hasText(normalizedType)) {
            queryWrapper.eq(Question::getType, normalizedType);
        }

        if (StringUtils.hasText(normalizedDifficulty)) {
            queryWrapper.eq(Question::getDifficulty, normalizedDifficulty);
        }

        if (StringUtils.hasText(normalizedKeyword)) {
            queryWrapper.and(wrapper -> wrapper.like(Question::getStem, normalizedKeyword)
                    .or()
                    .like(Question::getKnowledgePoint, normalizedKeyword)
                    .or()
                    .like(Question::getAnalysis, normalizedKeyword));
        }

        queryWrapper.orderByDesc(Question::getUpdatedAt).orderByDesc(Question::getId);
        return page(new Page<>(currentPage, currentPageSize), queryWrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Question createQuestion(QuestionCreateRequest request) {
        Question question = Question.builder()
                .type(normalize(request.getType()))
                .subjectId(normalize(request.getSubjectId()))
                .chapterId(normalize(request.getChapterId()))
                .difficulty(normalize(request.getDifficulty()))
                .status(normalize(request.getStatus()))
                .stem(normalize(request.getStem()))
                .knowledgePoint(defaultString(request.getKnowledgePoint()))
                .analysis(defaultString(request.getAnalysis()))
                .content(writeJson(request.getContent()))
                .deleted(0)
                .build();

        save(question);
        return getById(question.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Question updateQuestion(Long id, QuestionUpdateRequest request) {
        Question question = getById(id);
        if (question == null) {
            throw new IllegalArgumentException("习题不存在");
        }

        question.setType(normalize(request.getType()));
        question.setSubjectId(normalize(request.getSubjectId()));
        question.setChapterId(normalize(request.getChapterId()));
        question.setDifficulty(normalize(request.getDifficulty()));
        question.setStatus(normalize(request.getStatus()));
        question.setStem(normalize(request.getStem()));
        question.setKnowledgePoint(defaultString(request.getKnowledgePoint()));
        question.setAnalysis(defaultString(request.getAnalysis()));
        question.setContent(writeJson(request.getContent()));

        updateById(question);
        return getById(id);
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception ex) {
            throw new IllegalStateException("习题内容序列化失败", ex);
        }
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private String defaultString(String value) {
        return value == null ? "" : value.trim();
    }
}