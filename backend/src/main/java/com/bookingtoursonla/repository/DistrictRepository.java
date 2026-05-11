package com.bookingtoursonla.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.bookingtoursonla.entity.District;

public interface DistrictRepository
        extends JpaRepository<District, Long> {
    List<District> findByDeletedFalse();

    Page<District> findByDeletedFalse(Pageable pageable);

    Page<District> findByDeletedFalseAndNameContainingIgnoreCase(
            String keyword,
            Pageable pageable);

    Page<District> findByDeletedFalseAndProvince_Id(
            Long provinceId,
            Pageable pageable);

    Page<District> findByDeletedFalseAndNameContainingIgnoreCaseAndProvince_Id(
            String keyword,
            Long provinceId,
            Pageable pageable);

    boolean existsByNameIgnoreCaseAndProvince_IdAndDeletedFalse(
            String name,
            Long provinceId);

    java.util.Optional<District> findByIdAndDeletedFalse(Long id);
}