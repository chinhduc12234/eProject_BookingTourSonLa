package com.bookingtoursonla.service;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

        private static final String SECRET_KEY = "bookingtoursonlasecretkeybookingtoursonlasecretkey123456";

        private static final long EXPIRATION = 1000 * 60 * 60 * 24;

        private SecretKey getSignKey() {
                return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
        }

        public String generateToken(String email) {

                return Jwts.builder()
                                .subject(email)
                                .issuedAt(new Date())
                                .expiration(new Date(System.currentTimeMillis() + EXPIRATION))
                                .signWith(getSignKey(), SignatureAlgorithm.HS256)
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
                                .verifyWith(getSignKey())
                                .build()
                                .parseSignedClaims(token)
                                .getPayload();
        }
}