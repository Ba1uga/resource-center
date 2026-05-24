package com.baluga.backend.modules.mapping.entity;

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
@TableName("resource_chunk")
public class ResourceChunk {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("resource_type")
    private String resourceType;

    @TableField("resource_id")
    private Long resourceId;

    @TableField("content_id")
    private Long contentId;

    @TableField("chunk_index")
    private Integer chunkIndex;

    @TableField("chunk_text")
    private String chunkText;

    @TableField("token_count")
    private Integer tokenCount;

    @TableField("content_type")
    private String contentType;

    @TableField("page_number")
    private Integer pageNumber;

    @TableField("slide_number")
    private Integer slideNumber;

    @TableField("timestamp_start")
    private Integer timestampStart;

    @TableField("timestamp_end")
    private Integer timestampEnd;

    @TableField("section_title")
    private String sectionTitle;

    @TableField("embedding_id")
    private String embeddingId;

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer deleted;
}
