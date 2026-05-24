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
@TableName("knowledge_point")
public class KnowledgePoint {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private String course;

    private String chapter;

    private String description;

    @TableField("source_type")
    private String sourceType;

    @TableField("source_id")
    private Long sourceId;

    // V15: 层级知识节点扩展字段
    @TableField("parent_id")
    private Long parentId;

    @TableField("node_type")
    private String nodeType;

    @TableField("node_level")
    private Integer nodeLevel;

    @TableField("sort_order")
    private Integer sortOrder;

    @TableField("difficulty")
    private String difficulty;

    @TableField("bloom_level")
    private Integer bloomLevel;

    @TableField("keywords")
    private String keywords;

    @TableField("prerequisites")
    private String prerequisites;

    @TableField("embedding_id")
    private String embeddingId;

    @TableField("extra_meta")
    private String extraMeta;

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer deleted;
}
