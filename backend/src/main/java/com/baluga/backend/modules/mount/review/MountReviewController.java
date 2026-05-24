package com.baluga.backend.modules.mount.review;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baluga.backend.common.api.R;
import com.baluga.backend.modules.mapping.entity.MountReviewRecord;
import com.baluga.backend.modules.mount.review.dto.ReviewActionRequest;
import com.baluga.backend.modules.mount.review.dto.ReviewStatisticsVO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/mount/reviews")
public class MountReviewController {

    private final MountReviewService mountReviewService;

    public MountReviewController(MountReviewService mountReviewService) {
        this.mountReviewService = mountReviewService;
    }

    @GetMapping
    public R<Page<MountReviewRecord>> listReviews(
            @RequestParam(required = false) String action,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        return R.ok(mountReviewService.pageReviews(action, page, pageSize));
    }

    @GetMapping("/{id}")
    public R<MountReviewRecord> getReview(@PathVariable Long id) {
        MountReviewRecord record = mountReviewService.getReview(id);
        if (record == null) return R.fail("审核记录不存在");
        return R.ok(record);
    }

    @PostMapping("/{id}/approve")
    public R<MountReviewRecord> approve(@PathVariable Long id,
                                         @RequestBody ReviewActionRequest request) {
        try {
            return R.ok(mountReviewService.approve(id, request));
        } catch (Exception e) {
            return R.fail(e.getMessage());
        }
    }

    @PostMapping("/{id}/modify")
    public R<MountReviewRecord> modify(@PathVariable Long id,
                                        @RequestBody ReviewActionRequest request) {
        try {
            return R.ok(mountReviewService.modify(id, request));
        } catch (Exception e) {
            return R.fail(e.getMessage());
        }
    }

    @PostMapping("/{id}/reject")
    public R<MountReviewRecord> reject(@PathVariable Long id,
                                        @RequestBody ReviewActionRequest request) {
        try {
            return R.ok(mountReviewService.reject(id, request));
        } catch (Exception e) {
            return R.fail(e.getMessage());
        }
    }

    @GetMapping("/stats")
    public R<ReviewStatisticsVO> getStatistics() {
        return R.ok(mountReviewService.getStatistics());
    }
}
