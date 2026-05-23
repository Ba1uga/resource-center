package com.baluga.backend.modules.textbook.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baluga.backend.common.api.R;
import com.baluga.backend.common.exception.ResourceNotFoundException;
import com.baluga.backend.modules.textbook.dto.request.TextbookCreateRequest;
import com.baluga.backend.modules.textbook.dto.request.TextbookPageRequest;
import com.baluga.backend.modules.textbook.dto.request.TextbookUpdateRequest;
import com.baluga.backend.modules.textbook.dto.response.TextbookVO;
import com.baluga.backend.modules.textbook.entity.Textbook;
import com.baluga.backend.modules.textbook.service.TextbookService;
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
@RequestMapping("/api/textbooks")
public class TextbookController {

    private final TextbookService textbookService;

    @GetMapping
    public R<Page<TextbookVO>> listTextbooks(@Valid TextbookPageRequest request) {
        Page<Textbook> pageResult = textbookService.pageTextbooks(
                request.getKeyword(),
                request.getCourse(),
                request.getPage(),
                request.getPageSize()
        );

        Page<TextbookVO> responsePage = new Page<>(pageResult.getCurrent(), pageResult.getSize(), pageResult.getTotal());
        responsePage.setRecords(pageResult.getRecords().stream().map(TextbookVO::fromEntity).toList());
        return R.ok(responsePage);
    }

    @GetMapping("/{id}")
    public R<?> getTextbook(@PathVariable Long id) {
        Textbook textbook = textbookService.getById(id);
        if (textbook == null) {
            throw new ResourceNotFoundException("教材不存在");
        }
        return R.ok(TextbookVO.fromEntity(textbook));
    }

    @PostMapping
    public R<TextbookVO> createTextbook(@Valid @RequestBody TextbookCreateRequest request) {
        Textbook textbook = textbookService.createTextbook(request);
        return R.ok(TextbookVO.fromEntity(textbook));
    }

    @PutMapping("/{id}")
    public R<?> updateTextbook(@PathVariable Long id, @Valid @RequestBody TextbookUpdateRequest request) {
        Textbook textbook = textbookService.updateTextbook(id, request);
        return R.ok(TextbookVO.fromEntity(textbook));
    }

    @DeleteMapping("/{id}")
    public R<?> deleteTextbook(@PathVariable Long id) {
        Textbook textbook = textbookService.getById(id);
        if (textbook == null) {
            throw new ResourceNotFoundException("教材不存在");
        }

        textbookService.deleteTextbookWithAssets(id);
        return R.ok();
    }
}
