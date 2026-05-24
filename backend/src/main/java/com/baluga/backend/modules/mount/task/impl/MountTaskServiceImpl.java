package com.baluga.backend.modules.mount.task.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baluga.backend.modules.mapping.entity.AiMountTask;
import com.baluga.backend.modules.mapping.mapper.AiMountTaskMapper;
import com.baluga.backend.modules.mount.dto.request.CreateMountTaskRequest;
import com.baluga.backend.modules.mount.orchestrator.MountOrchestrator;
import com.baluga.backend.modules.mount.task.MountTaskService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.concurrent.CompletableFuture;


@Service
public class MountTaskServiceImpl implements MountTaskService {

    private static final Logger log = LoggerFactory.getLogger(MountTaskServiceImpl.class);

    private final AiMountTaskMapper taskMapper;
    private final MountOrchestrator orchestrator;

    public MountTaskServiceImpl(AiMountTaskMapper taskMapper,
                                 MountOrchestrator orchestrator) {
        this.taskMapper = taskMapper;
        this.orchestrator = orchestrator;
    }

    @Override
    @Transactional
    public AiMountTask createTask(CreateMountTaskRequest request) {
        AiMountTask task = AiMountTask.builder()
                .taskType(request.getTaskType())
                .resourceType(request.getResourceType())
                .resourceId(request.getResourceId())
                .batchId(request.getBatchId())
                .status("queued")
                .priority(request.getPriority() != null ? request.getPriority() : 5)
                .progress(java.math.BigDecimal.ZERO)
                .currentPhase("")
                .phaseDetail("")
                .totalItems(0)
                .completedItems(0)
                .failedItems(0)
                .errorMessage(null)
                .configSnapshot(null)
                .deleted(0)
                .build();
        taskMapper.insert(task);

        log.info("挂载任务创建: id={}, type={}, resource={}/{}",
                task.getId(), request.getTaskType(),
                request.getResourceType(), request.getResourceId());

        // Execute asynchronously
        executeAsync(task);

        return task;
    }

    @Override
    public AiMountTask getTask(Long taskId) {
        return taskMapper.selectById(taskId);
    }

    @Override
    public Page<AiMountTask> pageTasks(String status, Integer page, Integer pageSize) {
        LambdaQueryWrapper<AiMountTask> wrapper = Wrappers.lambdaQuery();
        if (StringUtils.hasText(status)) {
            wrapper.eq(AiMountTask::getStatus, status);
        }
        wrapper.orderByDesc(AiMountTask::getCreatedAt);
        return taskMapper.selectPage(new Page<>(
                page != null ? page : 1,
                pageSize != null ? pageSize : 10), wrapper);
    }

    @Override
    @Transactional
    public void cancelTask(Long taskId) {
        AiMountTask task = taskMapper.selectById(taskId);
        if (task == null) throw new IllegalArgumentException("任务不存在");
        if (!"queued".equals(task.getStatus())) {
            throw new IllegalStateException("只能取消排队中的任务");
        }
        task.setStatus("cancelled");
        task.setCompletedAt(LocalDateTime.now());
        taskMapper.updateById(task);
    }

    @Override
    @Transactional
    public void retryTask(Long taskId) {
        AiMountTask task = taskMapper.selectById(taskId);
        if (task == null) throw new IllegalArgumentException("任务不存在");
        if (!"failed".equals(task.getStatus())) {
            throw new IllegalStateException("只能重试失败的任务");
        }
        task.setStatus("queued");
        task.setProgress(java.math.BigDecimal.ZERO);
        task.setErrorMessage(null);
        taskMapper.updateById(task);
        executeAsync(task);
    }

    private void executeAsync(AiMountTask task) {
        CompletableFuture.runAsync(() -> {
            task.setStatus("parsing");
            task.setStartedAt(LocalDateTime.now());
            taskMapper.updateById(task);
            orchestrator.executeFullPipeline(task);
        });
    }
}
