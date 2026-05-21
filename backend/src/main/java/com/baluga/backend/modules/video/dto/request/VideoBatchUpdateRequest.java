package com.baluga.backend.modules.video.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;


@Data
public class VideoBatchUpdateRequest {

    @NotEmpty(message = "请选择视频")
    private List<Long> ids;

    @NotNull(message = "请指定批量操作类型")
    private String action;
}
