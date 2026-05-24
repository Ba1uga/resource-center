package com.baluga.backend.modules.mount.task;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baluga.backend.modules.mapping.entity.AiMountTask;
import com.baluga.backend.modules.mount.dto.request.CreateMountTaskRequest;


public interface MountTaskService {

    AiMountTask createTask(CreateMountTaskRequest request);

    AiMountTask getTask(Long taskId);

    Page<AiMountTask> pageTasks(String status, Integer page, Integer pageSize);

    void cancelTask(Long taskId);

    void retryTask(Long taskId);
}
