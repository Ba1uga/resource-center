package com.baluga.backend.modules.video.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baluga.backend.common.api.R;
import com.baluga.backend.modules.video.dto.request.VideoBatchUpdateRequest;
import com.baluga.backend.modules.video.dto.request.VideoCreateRequest;
import com.baluga.backend.modules.video.dto.request.VideoPageRequest;
import com.baluga.backend.modules.video.dto.request.VideoUpdateRequest;
import com.baluga.backend.modules.video.dto.response.VideoVO;
import com.baluga.backend.modules.video.entity.Video;
import com.baluga.backend.modules.video.service.VideoService;
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
@RequestMapping("/api/videos")
public class VideoController {

    private final VideoService videoService;
    private final ObjectMapper objectMapper;

    @GetMapping
    public R<Page<VideoVO>> listVideos(@Valid VideoPageRequest request) {
        Page<Video> pageResult = videoService.pageVideos(
                request.getKeyword(),
                request.getCourse(),
                request.getChapter(),
                request.getProcessingStatus(),
                request.getPublishStatus(),
                request.getUploadedBy(),
                request.getUploadedFrom(),
                request.getUploadedTo(),
                request.getPage(),
                request.getPageSize()
        );

        Page<VideoVO> responsePage = new Page<>(pageResult.getCurrent(), pageResult.getSize(), pageResult.getTotal());
        responsePage.setRecords(pageResult.getRecords().stream()
                .map(video -> VideoVO.fromEntity(video, objectMapper))
                .toList());
        return R.ok(responsePage);
    }

    @GetMapping("/{id}")
    public R<?> getVideo(@PathVariable Long id) {
        Video video = videoService.getById(id);
        if (video == null) {
            return R.fail("视频不存在");
        }
        return R.ok(VideoVO.fromEntity(video, objectMapper));
    }

    @PostMapping
    public R<VideoVO> createVideo(@Valid @RequestBody VideoCreateRequest request) {
        Video video = videoService.createVideo(request);
        return R.ok(VideoVO.fromEntity(video, objectMapper));
    }

    @PutMapping("/{id}")
    public R<?> updateVideo(@PathVariable Long id, @Valid @RequestBody VideoUpdateRequest request) {
        Video video = videoService.updateVideo(id, request);
        return R.ok(VideoVO.fromEntity(video, objectMapper));
    }

    @DeleteMapping("/{id}")
    public R<?> deleteVideo(@PathVariable Long id) {
        Video video = videoService.getById(id);
        if (video == null) {
            return R.fail("视频不存在");
        }

        videoService.removeById(id);
        return R.ok();
    }

    @PostMapping("/batch")
    public R<?> batchUpdateVideos(@Valid @RequestBody VideoBatchUpdateRequest request) {
        switch (request.getAction()) {
            case "publish":
                videoService.batchPublish(request.getIds());
                break;
            case "offline":
                videoService.batchOffline(request.getIds());
                break;
            case "delete":
                videoService.batchDelete(request.getIds());
                break;
            default:
                return R.fail("不支持的批量操作：" + request.getAction());
        }

        return R.ok();
    }
}