package com.baluga.backend.common.exception;

import com.baluga.backend.common.api.R;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.validation.BindException;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;


@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<R<Void>> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex) {
        return ResponseEntity.badRequest()
                .body(new R<>(400, extractFirstErrorMessage(ex.getBindingResult()), null));
    }

    @ExceptionHandler(BindException.class)
    public ResponseEntity<R<Void>> handleBindException(BindException ex) {
        return ResponseEntity.badRequest()
                .body(new R<>(400, extractFirstErrorMessage(ex.getBindingResult()), null));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<R<Void>> handleResourceNotFoundException(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new R<>(404, ex.getMessage(), null));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<R<Void>> handleException(Exception ex) {
        String message = StringUtils.hasText(ex.getMessage()) ? ex.getMessage() : "服务器内部异常";
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new R<>(500, message, null));
    }

    private String extractFirstErrorMessage(BindingResult bindingResult) {
        if (bindingResult.getFieldError() != null && StringUtils.hasText(bindingResult.getFieldError().getDefaultMessage())) {
            return bindingResult.getFieldError().getDefaultMessage();
        }
        if (bindingResult.getAllErrors().isEmpty()) {
            return "参数校验失败";
        }
        String defaultMessage = bindingResult.getAllErrors().get(0).getDefaultMessage();
        return StringUtils.hasText(defaultMessage) ? defaultMessage : "参数校验失败";
    }
}
