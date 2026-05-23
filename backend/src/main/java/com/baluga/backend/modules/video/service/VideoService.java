package com.baluga.backend.modules.video.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.baluga.backend.modules.video.dto.request.VideoCreateRequest;
import com.baluga.backend.modules.video.dto.request.VideoUpdateRequest;
import com.baluga.backend.modules.video.entity.Video;

import java.util.List;


public interface VideoService extends IService<Video> {

    Page<Video> pageVideos(String keyword, String course, String chapter,
                           String processingStatus, String publishStatus,
                           String uploadedBy, String uploadedFrom, String uploadedTo,
                           Integer page, Integer pageSize);

    Video createVideo(VideoCreateRequest request);

    Video updateVideo(Long id, VideoUpdateRequest request);

    void batchPublish(List<Long> ids);

    void batchOffline(List<Long> ids);

    void batchDelete(List<Long> ids);

    void deleteVideoWithAssets(Long id);
}