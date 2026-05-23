package com.baluga.backend.modules.storage.controller;

import com.baluga.backend.common.api.R;
import com.baluga.backend.modules.storage.dto.request.AbortUploadRequest;
import com.baluga.backend.modules.storage.dto.request.CompleteUploadRequest;
import com.baluga.backend.modules.storage.dto.request.InitUploadRequest;
import com.baluga.backend.modules.storage.dto.response.CompleteUploadResponse;
import com.baluga.backend.modules.storage.dto.response.InitUploadResponse;
import com.baluga.backend.modules.storage.service.UploadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/upload")
public class UploadController {

    private final UploadService uploadService;

    @PostMapping("/init")
    public R<InitUploadResponse> initUpload(@Valid @RequestBody InitUploadRequest request) {
        InitUploadResponse response = uploadService.initUpload(request);
        return R.ok(response);
    }

    @PostMapping("/{uploadToken}")
    public R<Void> uploadFile(
            @PathVariable String uploadToken,
            @RequestParam("file") MultipartFile file) {
        uploadService.uploadFile(uploadToken, file);
        return R.ok();
    }

    @PostMapping("/complete")
    public R<CompleteUploadResponse> completeUpload(@Valid @RequestBody CompleteUploadRequest request) {
        CompleteUploadResponse response = uploadService.completeUpload(request);
        return R.ok(response);
    }

    @PostMapping("/abort")
    public R<Void> abortUpload(@Valid @RequestBody AbortUploadRequest request) {
        uploadService.abortUpload(request);
        return R.ok();
    }
}
