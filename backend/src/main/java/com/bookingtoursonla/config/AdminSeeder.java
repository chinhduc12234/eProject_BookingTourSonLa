package com.bookingtoursonla.config;

import com.bookingtoursonla.entity.Role;
import com.bookingtoursonla.entity.User;
import com.bookingtoursonla.entity.enums.RoleName;
import com.bookingtoursonla.repository.RoleRepository;
import com.bookingtoursonla.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;

    private final RoleRepository roleRepository;

    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        for (RoleName roleName : RoleName.values()) {
            roleRepository
                    .findByName(roleName)
                    .orElseGet(() -> roleRepository.save(new Role(roleName)));
        }

        if (userRepository.existsByEmail("admin@gmail.com")) {
            return;
        }

        Role adminRole = roleRepository
                .findByName(RoleName.ADMIN)
                .orElseThrow();

        User admin = new User();

        admin.setFullName("Administrator");

        admin.setEmail("admin@gmail.com");

        admin.setPhone("0123456789");

        admin.setPassword(
                passwordEncoder.encode("123456"));

        admin.setRole(adminRole);

        userRepository.save(admin);

        System.out.println("ADMIN CREATED");
    }
}
