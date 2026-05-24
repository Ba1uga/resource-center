package com.baluga.backend.modules.mount.review;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baluga.backend.modules.mapping.entity.MountReviewRecord;
import com.baluga.backend.modules.mount.review.dto.ReviewActionRequest;
import com.baluga.backend.modules.mount.review.dto.ReviewStatisticsVO;


public interface MountReviewService {

    Page<MountReviewRecord> pageReviews(String status, Integer page, Integer pageSize);

    MountReviewRecord getReview(Long reviewId);

    MountReviewRecord approve(Long reviewId, ReviewActionRequest request);

    MountReviewRecord modify(Long reviewId, ReviewActionRequest request);

    MountReviewRecord reject(Long reviewId, ReviewActionRequest request);

    ReviewStatisticsVO getStatistics();
}
