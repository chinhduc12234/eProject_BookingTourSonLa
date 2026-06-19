package com.bookingtoursonla.security;

import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.bookingtoursonla.entity.User;
import com.bookingtoursonla.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

        private final UserRepository userRepository;

        @Override
        public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new UsernameNotFoundException(
                                                "Kh\u00f4ng t\u00ecm th\u1ea5y ng\u01b0\u1eddi d\u00f9ng: " + email));

                if (user.getRole() == null) {
                        throw new UsernameNotFoundException("Ng\u01b0\u1eddi d\u00f9ng ch\u01b0a \u0111\u01b0\u1ee3c g\u00e1n vai tr\u00f2");
                }

                if (user.getDeletedAt() != null || !Boolean.TRUE.equals(user.getIsActive())) {
                        throw new UsernameNotFoundException("T\u00e0i kho\u1ea3n \u0111\u00e3 b\u1ecb v\u00f4 hi\u1ec7u h\u00f3a");
                }

                String roleName = "ROLE_" + user.getRole().getName().name();

                return new org.springframework.security.core.userdetails.User(
                                user.getEmail(),
                                user.getPassword(),
                                List.of(new SimpleGrantedAuthority(roleName)));
        }
}
