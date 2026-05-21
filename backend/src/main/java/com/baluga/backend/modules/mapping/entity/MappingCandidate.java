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
@TableName("mapping_candidate")
public class MappingCandidate {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("mapping_record_id")
    private Long mappingRecordId;

    @TableField("knowledge_point_id")
    private Long knowledgePointId;

    @TableField("knowledge_point_name")
    private String knowledgePointName;

    @TableField("confidence_level")
    private String confidenceLevel;

    @TableField("matched_by")
    private String matchedBy;

    private String note;

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer deleted;
}
