package com.bookingtoursonla.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.bookingtoursonla.entity.Province;

public interface ProvinceRepository extends JpaRepository<Province, Long> {

    Page<Province> findByDeletedFalse(Pageable pageable);

    Page<Province> findByDeletedFalseAndNameContainingIgnoreCase(
            String keyword,
            Pageable pageable);

    Optional<Province> findByIdAndDeletedFalse(Long id);

    boolean existsByNameIgnoreCaseAndDeletedFalse(String name);
}
