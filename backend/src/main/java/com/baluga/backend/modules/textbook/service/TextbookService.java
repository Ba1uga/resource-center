package com.baluga.backend.modules.textbook.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.baluga.backend.modules.textbook.dto.request.TextbookCreateRequest;
import com.baluga.backend.modules.textbook.dto.request.TextbookUpdateRequest;
import com.baluga.backend.modules.textbook.entity.Textbook;


public interface TextbookService extends IService<Textbook> {

    Page<Textbook> pageTextbooks(String keyword, String course, Integer page, Integer pageSize);

    Textbook createTextbook(TextbookCreateRequest request);

    Textbook updateTextbook(Long id, TextbookUpdateRequest request);

    void deleteTextbookWithAssets(Long id);
}
