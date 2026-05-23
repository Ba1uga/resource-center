package com.baluga.backend.modules.textbook.dto.response;

import com.baluga.backend.modules.textbook.entity.Textbook;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TextbookVO {

    private Long id;

    private String name;

    private String author;

    private String publisher;

    private String edition;

    private String isbn;

    private String course;

    private String ownerId;

    private Long assetId;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Shanghai")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Shanghai")
    private LocalDateTime updatedAt;

    public static TextbookVO fromEntity(Textbook textbook) {
        return TextbookVO.builder()
                .id(textbook.getId())
                .name(textbook.getName())
                .author(textbook.getAuthor())
                .publisher(textbook.getPublisher())
                .edition(textbook.getEdition())
                .isbn(textbook.getIsbn())
                .course(textbook.getCourse())
                .ownerId(textbook.getOwnerId())
                .assetId(textbook.getAssetId())
                .createdAt(textbook.getCreatedAt())
                .updatedAt(textbook.getUpdatedAt())
                .build();
    }
}
