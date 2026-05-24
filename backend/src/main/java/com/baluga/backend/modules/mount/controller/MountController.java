package com.baluga.backend.modules.mount.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baluga.backend.common.api.R;
import com.baluga.backend.modules.mapping.entity.AiMountTask;
import com.baluga.backend.modules.mount.dto.request.CreateMountTaskRequest;
import com.baluga.backend.modules.mount.dto.request.MountPreviewRequest;
import com.baluga.backend.modules.mount.dto.response.MountPreviewVO;
import com.baluga.backend.modules.mount.feedback.FeedbackCollector;
import com.baluga.backend.modules.mount.service.MountService;
import com.baluga.backend.modules.mount.task.MountTaskService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;


@RestController
@RequestMapping("/api/mount")
public class MountController {

    private final MountService mountService;
    private final MountTaskService mountTaskService;
    private final FeedbackCollector feedbackCollector;

    public MountController(MountService mountService, MountTaskService mountTaskService,
                            FeedbackCollector feedbackCollector) {
        this.mountService = mountService;
        this.mountTaskService = mountTaskService;
        this.feedbackCollector = feedbackCollector;
    }

    // ===== Intelligence =====

    @PostMapping("/intelligence/preview")
    public R<MountPreviewVO> preview(@Valid @RequestBody MountPreviewRequest request) {
        return R.ok(mountService.preview(request));
    }

    // ===== Tasks =====

    @PostMapping("/tasks")
    public R<AiMountTask> createTask(@Valid @RequestBody CreateMountTaskRequest request) {
        return R.ok(mountTaskService.createTask(request));
    }

    @GetMapping("/tasks")
    public R<Page<AiMountTask>> listTasks(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        return R.ok(mountTaskService.pageTasks(status, page, pageSize));
    }

    @GetMapping("/tasks/{id}")
    public R<AiMountTask> getTask(@PathVariable Long id) {
        AiMountTask task = mountTaskService.getTask(id);
        if (task == null) return R.fail("任务不存在");
        return R.ok(task);
    }

    @PostMapping("/tasks/{id}/cancel")
    public R<Void> cancelTask(@PathVariable Long id) {
        try {
            mountTaskService.cancelTask(id);
            return R.ok();
        } catch (Exception e) {
            return R.fail(e.getMessage());
        }
    }

    @PostMapping("/tasks/{id}/retry")
    public R<Void> retryTask(@PathVariable Long id) {
        try {
            mountTaskService.retryTask(id);
            return R.ok();
        } catch (Exception e) {
            return R.fail(e.getMessage());
        }
    }

    // ===== Feedback =====

    @GetMapping("/feedback/export")
    public R<Map<String, Object>> exportFeedback() {
        String jsonl = feedbackCollector.exportFeedbackJsonl();
        return R.ok(Map.of("jsonl", jsonl));
    }

    @PostMapping("/feedback/mark-used")
    public R<Map<String, Object>> markFeedbackUsed() {
        int count = feedbackCollector.markAsUsed();
        return R.ok(Map.of("markedCount", count));
    }
}
