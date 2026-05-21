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
@TableName("mapping_record")
public class MappingRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("batch_id")
    private Long batchId;

    @TableField("resource_type")
    private String resourceType;

    @TableField("resource_id")
    private Long resourceId;

    @TableField("resource_title")
    private String resourceTitle;

    @TableField("course_name")
    private String courseName;

    @TableField("chapter_name")
    private String chapterName;

    @TableField("review_status")
    private String reviewStatus;

    @TableField("confidence_level")
    private String confidenceLevel;

    @TableField("primary_knowledge_point_id")
    private Long primaryKnowledgePointId;

    @TableField("selected_candidate_id")
    private Long selectedCandidateId;

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer deleted;
}
