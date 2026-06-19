package com.bookingtoursonla.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Date;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

class JwtServiceTest {

    private static final String SECRET = "booking-tour-son-la-test-secret-32-bytes";

    @Test
    void generatedTokenContainsEmailAndValidatesForUser() {
        JwtService jwtService = new JwtService(SECRET, 86_400_000);
        UserDetails userDetails = User.withUsername("customer@example.com")
                .password("unused")
                .authorities("ROLE_CUSTOMER")
                .build();

        String token = jwtService.generateToken(userDetails.getUsername());

        assertEquals(userDetails.getUsername(), jwtService.extractEmail(token));
        assertTrue(jwtService.isTokenValid(token, userDetails));
        assertTrue(jwtService.extractExpiration(token).after(new Date()));
    }

    @Test
    void shortSecretIsRejected() {
        assertThrows(
                IllegalStateException.class,
                () -> new JwtService("short-secret", 86_400_000));
    }
}
