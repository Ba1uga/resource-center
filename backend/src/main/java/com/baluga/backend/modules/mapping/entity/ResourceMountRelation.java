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

import java.math.BigDecimal;
import java.time.LocalDateTime;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("resource_mount_relation")
public class ResourceMountRelation {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("resource_type")
    private String resourceType;

    @TableField("resource_id")
    private Long resourceId;

    @TableField("resource_title")
    private String resourceTitle;

    @TableField("knowledge_node_id")
    private Long knowledgeNodeId;

    @TableField("knowledge_node_type")
    private String knowledgeNodeType;

    @TableField("knowledge_node_name")
    private String knowledgeNodeName;

    @TableField("mount_path")
    private String mountPath;

    @TableField("mount_source")
    private String mountSource;

    @TableField("confidence")
    private BigDecimal confidence;

    @TableField("mapping_record_id")
    private Long mappingRecordId;

    @TableField("status")
    private String status;

    @TableField("mounted_by")
    private String mountedBy;

    @TableField("mounted_at")
    private LocalDateTime mountedAt;

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer deleted;
}
