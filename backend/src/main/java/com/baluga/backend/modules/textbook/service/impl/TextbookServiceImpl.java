package com.baluga.backend.modules.textbook.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.baluga.backend.modules.textbook.entity.Textbook;
import com.baluga.backend.modules.textbook.mapper.TextbookMapper;
import com.baluga.backend.modules.textbook.service.TextbookService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;


@Service
public class TextbookServiceImpl extends ServiceImpl<TextbookMapper, Textbook> implements TextbookService {

    @Override
    public Page<Textbook> pageTextbooks(String keyword, String course, Integer page, Integer pageSize) {
        long currentPage = page != null && page > 0 ? page : 1L;
        long currentPageSize = pageSize != null && pageSize > 0 ? pageSize : 10L;

        LambdaQueryWrapper<Textbook> queryWrapper = Wrappers.lambdaQuery();
        String normalizedKeyword = keyword != null ? keyword.trim() : "";
        String normalizedCourse = course != null ? course.trim() : "";

        if (StringUtils.hasText(normalizedKeyword)) {
            queryWrapper.and(wrapper -> wrapper.like(Textbook::getName, normalizedKeyword)
                    .or()
                    .like(Textbook::getAuthor, normalizedKeyword)
                    .or()
                    .like(Textbook::getIsbn, normalizedKeyword));
        }

        if (StringUtils.hasText(normalizedCourse)) {
            queryWrapper.eq(Textbook::getCourse, normalizedCourse);
        }

        queryWrapper.orderByDesc(Textbook::getUpdatedAt);
        return page(new Page<>(currentPage, currentPageSize), queryWrapper);
    }
}
