package com.bookingtoursonla.controller;

import com.bookingtoursonla.dto.AuthResponse;
import com.bookingtoursonla.dto.LoginRequest;
import com.bookingtoursonla.dto.RegisterRequest;
import com.bookingtoursonla.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
