package com.baluga.backend.modules.storage.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.baluga.backend.modules.storage.dto.request.AbortUploadRequest;
import com.baluga.backend.modules.storage.dto.request.CompleteUploadRequest;
import com.baluga.backend.modules.storage.dto.request.InitUploadRequest;
import com.baluga.backend.modules.storage.dto.response.CompleteUploadResponse;
import com.baluga.backend.modules.storage.dto.response.InitUploadResponse;
import com.baluga.backend.modules.storage.entity.ResourceAsset;
import org.springframework.web.multipart.MultipartFile;


public interface UploadService extends IService<ResourceAsset> {

    InitUploadResponse initUpload(InitUploadRequest request);

    void uploadFile(String uploadToken, MultipartFile file);

    CompleteUploadResponse completeUpload(CompleteUploadRequest request);

    void abortUpload(AbortUploadRequest request);
}
