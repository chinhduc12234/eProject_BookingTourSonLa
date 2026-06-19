package com.bookingtoursonla.exception;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> handleRuntimeException(
            RuntimeException ex) {

        Map<String, Object> response = new HashMap<>();

        response.put("timestamp", LocalDateTime.now());

        response.put("message", ex.getMessage());

        response.put("status", 400);

        return response;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> handleValidationException(
            MethodArgumentNotValidException ex) {

        Map<String, Object> errors = new HashMap<>();

        ex.getBindingResult()
                .getFieldErrors()
                .forEach(error -> errors.put(
                        error.getField(),
                        error.getDefaultMessage()));

        Map<String, Object> response = new HashMap<>();

        response.put("timestamp", LocalDateTime.now());
        response.put("message", "D\u1eef li\u1ec7u kh\u00f4ng h\u1ee3p l\u1ec7");
        response.put("errors", errors);
        response.put("status", 400);

        return response;
    }
}
