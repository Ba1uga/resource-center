package com.baluga.backend.modules.storage.controller;

import com.baluga.backend.common.api.R;
import com.baluga.backend.modules.storage.config.StorageProperties;
import com.baluga.backend.modules.storage.dto.request.AbortUploadRequest;
import com.baluga.backend.modules.storage.dto.request.CompleteUploadRequest;
import com.baluga.backend.modules.storage.dto.request.InitUploadRequest;
import com.baluga.backend.modules.storage.dto.response.CompleteUploadResponse;
import com.baluga.backend.modules.storage.dto.response.InitUploadResponse;
import com.baluga.backend.modules.storage.entity.ResourceAsset;
import com.baluga.backend.modules.storage.service.UploadService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;


@Slf4j
@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/upload")
public class UploadController {

    private final UploadService uploadService;
    private final StorageProperties storageProperties;

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

    @GetMapping("/stream/{assetId}")
    public ResponseEntity<?> streamAsset(@PathVariable Long assetId, HttpServletRequest request) {
        ResourceAsset asset = uploadService.getById(assetId);
        if (asset == null || !"success".equals(asset.getUploadStatus())) {
            return ResponseEntity.notFound().build();
        }

        try {
            Path filePath = Path.of(storageProperties.getUploadDir(), asset.getObjectKey());
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }

            long fileSize = Files.size(filePath);
            String rangeHeader = request.getHeader("Range");

            if (rangeHeader != null) {
                return streamRange(filePath, fileSize, rangeHeader, asset.getMimeType(), asset.getOriginName());
            }

            return streamFull(filePath, fileSize, asset.getMimeType(), asset.getOriginName());

        } catch (IOException e) {
            log.error("读取预览文件失败: assetId={}", assetId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private ResponseEntity<InputStreamResource> streamFull(Path filePath, long fileSize,
            String mimeType, String originName) throws IOException {
        InputStreamResource resource = new InputStreamResource(Files.newInputStream(filePath));
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, mimeType)
                .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition(originName))
                .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(fileSize))
                .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                .body(resource);
    }

    private ResponseEntity<?> streamRange(Path filePath, long fileSize, String rangeHeader,
            String mimeType, String originName) throws IOException {
        // Parse "bytes=start-end" or "bytes=start-"
        String range = rangeHeader.replace("bytes=", "");
        String[] parts = range.split("-");
        long start = Long.parseLong(parts[0]);
        long end = parts.length > 1 && !parts[1].isEmpty() ? Long.parseLong(parts[1]) : fileSize - 1;

        if (start >= fileSize) {
            return ResponseEntity.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                    .header(HttpHeaders.CONTENT_RANGE, "bytes */" + fileSize)
                    .build();
        }

        end = Math.min(end, fileSize - 1);
        long contentLength = end - start + 1;

        InputStream input = Files.newInputStream(filePath);
        input.skip(start);

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_TYPE, mimeType);
        headers.set(HttpHeaders.CONTENT_DISPOSITION, contentDisposition(originName));
        headers.set(HttpHeaders.CONTENT_RANGE, "bytes " + start + "-" + end + "/" + fileSize);
        headers.set(HttpHeaders.CONTENT_LENGTH, String.valueOf(contentLength));
        headers.set(HttpHeaders.ACCEPT_RANGES, "bytes");

        return new ResponseEntity<>(new InputStreamResource(input), headers, HttpStatus.PARTIAL_CONTENT);
    }

    private static String contentDisposition(String filename) {
        try {
            String encoded = java.net.URLEncoder.encode(filename, java.nio.charset.StandardCharsets.UTF_8)
                    .replace("+", "%20");
            return "inline; filename*=UTF-8''" + encoded;
        } catch (Exception e) {
            return "inline";
        }
    }
}
