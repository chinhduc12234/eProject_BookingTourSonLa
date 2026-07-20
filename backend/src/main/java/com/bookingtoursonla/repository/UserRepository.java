package com.bookingtoursonla.repository;

import java.util.Optional;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.bookingtoursonla.entity.User;
import com.bookingtoursonla.entity.enums.Gender;

public interface UserRepository extends JpaRepository<User, Long> {

        @Query("SELECT u FROM User u WHERE u.deletedAt IS NULL AND u.role.id = 2 AND u.isActive = true ORDER BY u.fullName ASC")
        List<User> findAllActiveStaff();

        Optional<User> findByEmail(String email);

        Boolean existsByEmail(String email);

        Boolean existsByPhone(String phone);

        @Query("SELECT u FROM User u WHERE u.deletedAt IS NULL AND u.role.id = 2 AND " +
                        "(u.fullName LIKE %:keyword% OR u.email LIKE %:keyword% OR u.phone LIKE %:keyword%)")
        Page<User> findStaffByKeyword(
                        @Param("keyword") String keyword,
                        Pageable pageable);

        @Query("SELECT u FROM User u WHERE u.deletedAt IS NULL AND u.role.id = 2 AND u.gender = :gender AND " +
                        "(u.fullName LIKE %:keyword% OR u.email LIKE %:keyword% OR u.phone LIKE %:keyword%)")
        Page<User> findStaffByKeywordAndGender(
                        @Param("keyword") String keyword,
                        @Param("gender") Gender gender,
                        Pageable pageable);

        @Query("SELECT u FROM User u WHERE u.deletedAt IS NULL AND u.role.id = 2 AND u.isActive = :isActive AND " +
                        "(u.fullName LIKE %:keyword% OR u.email LIKE %:keyword% OR u.phone LIKE %:keyword%)")
        Page<User> findStaffByKeywordAndIsActive(
                        @Param("keyword") String keyword,
                        @Param("isActive") Boolean isActive,
                        Pageable pageable);

        @Query("SELECT u FROM User u WHERE u.deletedAt IS NULL AND u.role.id = 2 AND u.gender = :gender AND u.isActive = :isActive AND "
                        +
                        "(u.fullName LIKE %:keyword% OR u.email LIKE %:keyword% OR u.phone LIKE %:keyword%)")
        Page<User> findStaffByKeywordAndGenderAndIsActive(
                        @Param("keyword") String keyword,
                        @Param("gender") Gender gender,
                        @Param("isActive") Boolean isActive,
                        Pageable pageable);

        @Query("SELECT u FROM User u WHERE u.deletedAt IS NULL AND u.role.id = 2")
        Page<User> findAllStaff(Pageable pageable);

        @Query("SELECT u FROM User u WHERE u.deletedAt IS NULL AND u.role.id = 2 AND u.gender = :gender")
        Page<User> findAllStaffByGender(
                        @Param("gender") Gender gender,
                        Pageable pageable);

        @Query("SELECT u FROM User u WHERE u.deletedAt IS NULL AND u.role.id = 2 AND u.isActive = :isActive")
        Page<User> findAllStaffByIsActive(
                        @Param("isActive") Boolean isActive,
                        Pageable pageable);

        @Query("SELECT u FROM User u WHERE u.deletedAt IS NULL AND u.role.id = 2 AND u.gender = :gender AND u.isActive = :isActive")
        Page<User> findAllStaffByGenderAndIsActive(
                        @Param("gender") Gender gender,
                        @Param("isActive") Boolean isActive,
                        Pageable pageable);

}
