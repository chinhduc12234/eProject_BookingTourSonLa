package com.bookingtoursonla.service;

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

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email \u0111\u00e3 t\u1ed3n t\u1ea1i");
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("S\u1ed1 \u0111i\u1ec7n tho\u1ea1i \u0111\u00e3 t\u1ed3n t\u1ea1i");
        }

        Role customerRole = roleRepository
                .findByName(RoleName.CUSTOMER)
                .orElseThrow();

        User user = new User();

        user.setFullName(request.getFullName());

        user.setEmail(request.getEmail());

        user.setPhone(request.getPhone());

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

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow();

        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().getName().name());
    }
}
