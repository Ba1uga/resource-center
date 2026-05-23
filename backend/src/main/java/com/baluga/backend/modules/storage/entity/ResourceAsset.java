package com.baluga.backend.modules.storage.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("resource_asset")
public class ResourceAsset {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("module_type")
    private String moduleType;

    @TableField("module_id")
    private Long moduleId;

    private String bucket;

    @TableField("object_key")
    private String objectKey;

    @TableField("origin_name")
    private String originName;

    @TableField("mime_type")
    private String mimeType;

    @TableField("size_bytes")
    private Long sizeBytes;

    private String sha256;

    @TableField("upload_status")
    private String uploadStatus;

    @TableField("upload_token")
    private String uploadToken;

    @TableField("created_by")
    private String createdBy;

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer deleted;
}
