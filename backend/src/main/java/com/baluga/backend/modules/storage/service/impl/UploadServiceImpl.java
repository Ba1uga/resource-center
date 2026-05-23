package com.baluga.backend.modules.storage.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.baluga.backend.modules.storage.config.StorageProperties;
import com.baluga.backend.modules.storage.dto.request.AbortUploadRequest;
import com.baluga.backend.modules.storage.dto.request.CompleteUploadRequest;
import com.baluga.backend.modules.storage.dto.request.InitUploadRequest;
import com.baluga.backend.modules.storage.dto.response.CompleteUploadResponse;
import com.baluga.backend.modules.storage.dto.response.InitUploadResponse;
import com.baluga.backend.modules.storage.entity.ResourceAsset;
import com.baluga.backend.modules.storage.mapper.ResourceAssetMapper;
import com.baluga.backend.modules.storage.service.UploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.UUID;


@Slf4j
@Service
@RequiredArgsConstructor
public class UploadServiceImpl extends ServiceImpl<ResourceAssetMapper, ResourceAsset> implements UploadService {

    private final StorageProperties storageProperties;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public InitUploadResponse initUpload(InitUploadRequest request) {
        String uploadToken = UUID.randomUUID().toString();
        String dirToken = (request.getGroupToken() != null && !request.getGroupToken().isBlank())
                ? request.getGroupToken().trim()
                : uploadToken;
        String objectKey = request.getModuleType() + "/" + dirToken + "/" + request.getOriginName();

        ResourceAsset asset = ResourceAsset.builder()
                .moduleType(request.getModuleType().trim())
                .originName(request.getOriginName().trim())
                .mimeType(request.getMimeType().trim())
                .sizeBytes(request.getSizeBytes())
                .objectKey(objectKey)
                .bucket("local")
                .uploadToken(uploadToken)
                .uploadStatus("init")
                .createdBy("system")
                .deleted(0)
                .build();

        save(asset);

        ResourceAsset saved = getById(asset.getId());

        return InitUploadResponse.builder()
                .assetId(saved.getId())
                .uploadToken(uploadToken)
                .uploadUrl("/api/upload/" + uploadToken)
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void uploadFile(String uploadToken, MultipartFile file) {
        ResourceAsset asset = getByToken(uploadToken);
        log.info("开始上传文件: token={}, originName={}, moduleType={}, uploadDir={}",
                uploadToken, asset.getOriginName(), asset.getModuleType(), storageProperties.getUploadDir());

        try {
            Path targetPath = Path.of(storageProperties.getUploadDir(), asset.getObjectKey());
            Files.createDirectories(targetPath.getParent());
            log.info("文件存储目标: {}", targetPath.toAbsolutePath());
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }

            long actualSize = Files.size(targetPath);
            asset.setSizeBytes(actualSize);
            asset.setUploadStatus("uploading");
            updateById(asset);
            log.info("文件存储完成: targetPath={}, size={}", targetPath.toAbsolutePath(), actualSize);

        } catch (IOException e) {
            log.error("文件存储失败: {}", e.getMessage(), e);
            asset.setUploadStatus("failed");
            updateById(asset);
            throw new RuntimeException("文件存储失败: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CompleteUploadResponse completeUpload(CompleteUploadRequest request) {
        ResourceAsset asset = getByToken(request.getUploadToken());

        if (!"uploading".equals(asset.getUploadStatus())) {
            throw new IllegalStateException("上传状态异常，当前状态: " + asset.getUploadStatus());
        }

        try {
            Path targetPath = Path.of(storageProperties.getUploadDir(), asset.getObjectKey());
            String sha256 = computeSha256(targetPath);

            asset.setSha256(sha256);
            asset.setUploadStatus("success");
            updateById(asset);

            return CompleteUploadResponse.builder()
                    .assetId(asset.getId())
                    .objectKey(asset.getObjectKey())
                    .originName(asset.getOriginName())
                    .mimeType(asset.getMimeType())
                    .sizeBytes(asset.getSizeBytes())
                    .sha256(sha256)
                    .uploadStatus("success")
                    .build();

        } catch (IOException e) {
            asset.setUploadStatus("failed");
            updateById(asset);
            throw new RuntimeException("文件校验失败: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void abortUpload(AbortUploadRequest request) {
        ResourceAsset asset = getByToken(request.getUploadToken());

        try {
            Path filePath = Path.of(storageProperties.getUploadDir(), asset.getObjectKey());
            Files.deleteIfExists(filePath);

            Path tokenDir = filePath.getParent();
            if (Files.exists(tokenDir) && Files.isDirectory(tokenDir)) {
                Files.deleteIfExists(tokenDir);
            }
        } catch (IOException ignored) {
        }

        removeById(asset.getId());
    }

    private ResourceAsset getByToken(String uploadToken) {
        LambdaQueryWrapper<ResourceAsset> wrapper = Wrappers.lambdaQuery();
        wrapper.eq(ResourceAsset::getUploadToken, uploadToken);
        ResourceAsset asset = getOne(wrapper);
        if (asset == null) {
            throw new IllegalArgumentException("上传令牌无效: " + uploadToken);
        }
        return asset;
    }

    private String computeSha256(Path filePath) throws IOException {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            try (InputStream in = Files.newInputStream(filePath)) {
                byte[] buffer = new byte[8192];
                int read;
                while ((read = in.read(buffer)) != -1) {
                    digest.update(buffer, 0, read);
                }
            }
            return HexFormat.of().formatHex(digest.digest());
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256算法不可用", e);
        }
    }
}
