package com.bookingtoursonla.security;

import java.nio.charset.StandardCharsets;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthFilter;

        private final AuthenticationProvider authenticationProvider;

        @Bean
        public SecurityFilterChain securityFilterChain(
                        HttpSecurity http) throws Exception {

                http
                                .cors(Customizer.withDefaults())

                                .csrf(csrf -> csrf.disable())

                                .sessionManagement(session -> session.sessionCreationPolicy(
                                                SessionCreationPolicy.STATELESS))

                                .exceptionHandling(exceptions -> exceptions
                                                .authenticationEntryPoint((request, response, exception) -> {
                                                        response.setStatus(HttpStatus.UNAUTHORIZED.value());
                                                        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
                                                        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                                                        response.getWriter().write(
                                                                        "{\"status\":401,\"code\":\"AUTH_REQUIRED\","
                                                                                        + "\"message\":\"Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.\"}");
                                                })
                                                .accessDeniedHandler((request, response, exception) -> {
                                                        response.setStatus(HttpStatus.FORBIDDEN.value());
                                                        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
                                                        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                                                        response.getWriter().write(
                                                                        "{\"status\":403,\"code\":\"ACCESS_DENIED\","
                                                                                        + "\"message\":\"Bạn không có quyền thực hiện thao tác này.\"}");
                                                }))

                                .authenticationProvider(authenticationProvider)

                                .addFilterBefore(
                                                jwtAuthFilter,
                                                UsernamePasswordAuthenticationFilter.class)

                                .authorizeHttpRequests(auth -> auth

                                                .requestMatchers(
                                                                "/api/auth/**")
                                                .permitAll()

                                                .requestMatchers(
                                                                "/uploads/**")
                                                .permitAll()

                                                .requestMatchers(
                                                "/error")
                                                .permitAll()

                                                .requestMatchers(
                                                                "/actuator/health",
                                                                "/actuator/info")
                                                .permitAll()

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/tours/**")
                                                .permitAll()

                                                .requestMatchers(
                                                                "/api/bookings/**")
                                                .hasRole("CUSTOMER")

                                                .requestMatchers(
                                                                "/api/admin/**")
                                                .hasRole("ADMIN")

                                                .requestMatchers(
                                                                "/api/users/admin/**")
                                                .hasRole("ADMIN")

                                                .requestMatchers(
                                                                "/api/employee/**")
                                                .hasRole("EMPLOYEE")

                                                .anyRequest()
                                                .authenticated());

                return http.build();
        }
}
