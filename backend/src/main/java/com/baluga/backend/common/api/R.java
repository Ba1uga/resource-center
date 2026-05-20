package com.baluga.backend.common.api;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class R<T> {

    private int code;
    private String message;
    private T data;

    public static <T> R<T> ok(T data) {
        return new R<>(200, "success", data);
    }

    public static R<Void> ok() {
        return new R<>(200, "success", null);
    }

    public static <T> R<T> fail(String message) {
        return new R<>(500, message, null);
    }
}
