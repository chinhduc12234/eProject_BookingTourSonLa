package com.bookingtoursonla.config;

import com.bookingtoursonla.entity.Role;
import com.bookingtoursonla.entity.User;
import com.bookingtoursonla.entity.enums.RoleName;
import com.bookingtoursonla.repository.RoleRepository;
import com.bookingtoursonla.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final UserRepository userRepository;

    private final RoleRepository roleRepository;

    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed-admin.enabled:true}")
    private boolean seedAdminEnabled;

    @Value("${app.seed-admin.email:admin@gmail.com}")
    private String adminEmail;

    @Value("${app.seed-admin.full-name:Administrator}")
    private String adminFullName;

    @Value("${app.seed-admin.phone:0123456789}")
    private String adminPhone;

    @Value("${app.seed-admin.password:123456}")
    private String adminPassword;

    @Override
    public void run(String... args) {

        for (RoleName roleName : RoleName.values()) {
            roleRepository
                    .findByName(roleName)
                    .orElseGet(() -> roleRepository.save(new Role(roleName)));
        }

        if (!seedAdminEnabled) {
            return;
        }

        if (adminPassword == null || adminPassword.isBlank()) {
            log.warn("APP_ADMIN_PASSWORD chua duoc cau hinh; bo qua viec tao tai khoan admin mac dinh.");
            return;
        }

        User existingAdmin = userRepository
                .findByEmail(adminEmail)
                .orElse(null);

        if (existingAdmin != null) {
            if (!passwordEncoder.matches(adminPassword, existingAdmin.getPassword())) {
                existingAdmin.setPassword(passwordEncoder.encode(adminPassword));
                userRepository.save(existingAdmin);
                log.info("Da cap nhat mat khau admin mac dinh tu cau hinh.");
            }
            return;
        }

        Role adminRole = roleRepository
                .findByName(RoleName.ADMIN)
                .orElseThrow();

        User admin = new User();

        admin.setFullName(adminFullName);

        admin.setEmail(adminEmail);

        admin.setPhone(adminPhone);

        admin.setPassword(
                passwordEncoder.encode(adminPassword));

        admin.setRole(adminRole);

        userRepository.save(admin);

        log.info("Da tao tai khoan admin mac dinh tu cau hinh moi truong.");
    }
}
