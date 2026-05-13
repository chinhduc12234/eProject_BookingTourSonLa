package com.bookingtoursonla.config;

import com.bookingtoursonla.entity.Role;
import com.bookingtoursonla.entity.enums.RoleName;
import com.bookingtoursonla.repository.RoleRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(1)
@RequiredArgsConstructor
public class RoleSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        seedRole(RoleName.ADMIN);
        seedRole(RoleName.EMPLOYEE);
        seedRole(RoleName.CUSTOMER);
    }

    private void seedRole(RoleName roleName) {
        if (roleRepository.findByName(roleName).isPresent()) {
            return;
        }

        roleRepository.save(new Role(roleName));
    }
}
