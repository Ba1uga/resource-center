package com.baluga.backend.modules.textbook.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;


@Data
public class TextbookUpdateRequest {

    @NotBlank(message = "请填写教材名称")
    private String name;

    @NotBlank(message = "请填写作者")
    private String author;

    @NotBlank(message = "请填写出版社")
    private String publisher;

    @NotBlank(message = "请填写版本")
    private String edition;

    @NotBlank(message = "请填写 ISBN")
    @Pattern(regexp = "^\\d{10,13}$", message = "ISBN 需为 10 到 13 位数字")
    private String isbn;

    @NotBlank(message = "请填写关联课程")
    private String course;

    private Long assetId;
}
