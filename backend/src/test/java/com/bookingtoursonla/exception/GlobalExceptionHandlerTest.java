package com.bookingtoursonla.exception;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void authenticationErrorsReturnStableUnauthorizedPayload() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleAuthenticationException(
                        new BadCredentialsException("internal detail"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody())
                .containsEntry("status", 401)
                .containsEntry("code", "LOGIN_FAILED")
                .containsKey("timestamp");
        assertThat(response.getBody().get("message").toString())
                .doesNotContain("internal detail");
    }

    @Test
    void businessErrorsReturnStableBadRequestPayload() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleRuntimeException(
                        new RuntimeException("Không còn chỗ trống"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody())
                .containsEntry("status", 400)
                .containsEntry("code", "BUSINESS_RULE_VIOLATION")
                .containsEntry("message", "Không còn chỗ trống");
    }

}
