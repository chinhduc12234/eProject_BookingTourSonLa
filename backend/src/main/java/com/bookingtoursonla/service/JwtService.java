package com.bookingtoursonla.service;

import java.util.Date;
import java.nio.charset.StandardCharsets;

import javax.crypto.SecretKey;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

        private static final Logger log = LoggerFactory.getLogger(JwtService.class);

        private static final int MIN_HS256_SECRET_BYTES = 32;

        private final SecretKey signKey;

        private final long expirationMillis;

        public JwtService(
                        @Value("${jwt.secret:}") String secret,
                        @Value("${jwt.expiration:86400000}") long expirationMillis) {

                this.signKey = buildSignKey(secret);
                this.expirationMillis = expirationMillis;
        }

        private SecretKey buildSignKey(String secret) {

                if (secret == null || secret.isBlank()) {
                        log.warn("JWT_SECRET chua duoc cau hinh; he thong dang dung khoa tam thoi cho moi lan khoi dong.");
                        return Jwts.SIG.HS256.key().build();
                }

                byte[] secretBytes = secret.getBytes(StandardCharsets.UTF_8);

                if (secretBytes.length < MIN_HS256_SECRET_BYTES) {
                        throw new IllegalStateException("JWT_SECRET phai co it nhat 32 byte de ky HS256.");
                }

                return Keys.hmacShaKeyFor(secretBytes);
        }

        public String generateToken(String email) {

                return Jwts.builder()
                                .subject(email)
                                .issuedAt(new Date())
                                .expiration(new Date(System.currentTimeMillis() + expirationMillis))
                                .signWith(signKey, SignatureAlgorithm.HS256)
                                .compact();
        }

        public String extractEmail(String token) {
                return extractAllClaims(token).getSubject();
        }

        public Date extractExpiration(String token) {
                return extractAllClaims(token).getExpiration();
        }

        public boolean isTokenValid(String token, UserDetails userDetails) {

                final String email = extractEmail(token);

                return email.equals(userDetails.getUsername())
                                && !isTokenExpired(token);
        }

        private boolean isTokenExpired(String token) {
                return extractExpiration(token).before(new Date());
        }

        private Claims extractAllClaims(String token) {

                return Jwts.parser()
                                .verifyWith(signKey)
                                .build()
                                .parseSignedClaims(token)
                                .getPayload();
        }

        public Claims extractClaims(String token) {

                return extractAllClaims(token);
        }
}
