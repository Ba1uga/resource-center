package com.baluga.backend.modules.video.entity;

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

import java.time.LocalDate;
import java.time.LocalDateTime;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("video")
public class Video {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String title;

    private String course;

    private String chapter;

    private String duration;

    private String resolution;

    @TableField("view_count")
    private Integer viewCount;

    @TableField("uploaded_by")
    private String uploadedBy;

    @TableField("uploaded_at")
    private LocalDate uploadedAt;

    @TableField("file_size")
    private String fileSize;

    @TableField("last_edited_at")
    private LocalDateTime lastEditedAt;

    @TableField("cover_label")
    private String coverLabel;

    @TableField("knowledge_point")
    private String knowledgePoint;

    private String tags;

    private String description;

    @TableField("processing_status")
    private String processingStatus;

    @TableField("publish_status")
    private String publishStatus;

    @TableField("resource_alert")
    private String resourceAlert;

    private String visibility;

    @TableField("scheduled_publish_at")
    private LocalDateTime scheduledPublishAt;

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer deleted;
}
