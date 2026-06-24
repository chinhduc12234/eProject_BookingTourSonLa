package com.bookingtoursonla.service;

import java.util.Locale;

import com.bookingtoursonla.dto.AuthResponse;
import com.bookingtoursonla.dto.LoginRequest;
import com.bookingtoursonla.dto.RegisterRequest;
import com.bookingtoursonla.entity.Role;
import com.bookingtoursonla.entity.User;
import com.bookingtoursonla.entity.enums.RoleName;
import com.bookingtoursonla.repository.RoleRepository;
import com.bookingtoursonla.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    private final RoleRepository roleRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    private final AuthenticationManager authenticationManager;

    public AuthResponse register(
        RegisterRequest request) {

        String email = normalizeEmail(request.getEmail());
        String phone = request.getPhone().trim();

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email \u0111\u00e3 t\u1ed3n t\u1ea1i");
        }

        if (userRepository.existsByPhone(phone)) {
            throw new RuntimeException("S\u1ed1 \u0111i\u1ec7n tho\u1ea1i \u0111\u00e3 t\u1ed3n t\u1ea1i");
        }

        Role customerRole = roleRepository
                .findByName(RoleName.CUSTOMER)
                .orElseThrow();

        User user = new User();

        user.setFullName(request.getFullName().trim());

        user.setEmail(email);

        user.setPhone(phone);

        user.setPassword(
                passwordEncoder.encode(request.getPassword()));

        user.setRole(customerRole);

        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().getName().name());
    }

    public AuthResponse login(
            LoginRequest request) {

        String email = normalizeEmail(request.getEmail());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        email,
                        request.getPassword()));

        User user = userRepository
                .findByEmail(email)
                .orElseThrow();

        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().getName().name());
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
