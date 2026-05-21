package com.baluga.backend.modules.question.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baluga.backend.common.api.R;
import com.baluga.backend.modules.question.dto.request.QuestionCreateRequest;
import com.baluga.backend.modules.question.dto.request.QuestionPageRequest;
import com.baluga.backend.modules.question.dto.request.QuestionUpdateRequest;
import com.baluga.backend.modules.question.dto.response.QuestionVO;
import com.baluga.backend.modules.question.entity.Question;
import com.baluga.backend.modules.question.service.QuestionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.validation.annotation.Validated;


@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/questions")
public class QuestionController {

    private final QuestionService questionService;
    private final ObjectMapper objectMapper;

    @GetMapping
    public R<Page<QuestionVO>> listQuestions(@Valid QuestionPageRequest request) {
        Page<Question> pageResult = questionService.pageQuestions(
                request.getSubjectId(),
                request.getChapterId(),
                request.getType(),
                request.getDifficulty(),
                request.getKeyword(),
                request.getPage(),
                request.getPageSize()
        );

        Page<QuestionVO> responsePage = new Page<>(pageResult.getCurrent(), pageResult.getSize(), pageResult.getTotal());
        responsePage.setRecords(pageResult.getRecords().stream()
                .map(question -> QuestionVO.fromEntity(question, objectMapper))
                .toList());
        return R.ok(responsePage);
    }

    @GetMapping("/{id}")
    public R<?> getQuestion(@PathVariable Long id) {
        Question question = questionService.getById(id);
        if (question == null) {
            return R.fail("习题不存在");
        }
        return R.ok(QuestionVO.fromEntity(question, objectMapper));
    }

    @PostMapping
    public R<QuestionVO> createQuestion(@Valid @RequestBody QuestionCreateRequest request) {
        Question question = questionService.createQuestion(request);
        return R.ok(QuestionVO.fromEntity(question, objectMapper));
    }

    @PutMapping("/{id}")
    public R<?> updateQuestion(@PathVariable Long id, @Valid @RequestBody QuestionUpdateRequest request) {
        Question question = questionService.updateQuestion(id, request);
        return R.ok(QuestionVO.fromEntity(question, objectMapper));
    }

    @DeleteMapping("/{id}")
    public R<?> deleteQuestion(@PathVariable Long id) {
        Question question = questionService.getById(id);
        if (question == null) {
            return R.fail("习题不存在");
        }

        questionService.removeById(id);
        return R.ok();
    }
}