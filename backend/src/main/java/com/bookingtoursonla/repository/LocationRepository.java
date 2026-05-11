package com.bookingtoursonla.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.bookingtoursonla.entity.Location;

public interface LocationRepository
        extends JpaRepository<Location, Long> {

    Page<Location> findByDeletedAtIsNull(
            Pageable pageable);

    Page<Location> findByDeletedAtIsNullAndNameContainingIgnoreCase(
            String keyword,
            Pageable pageable);

    Page<Location> findByDeletedAtIsNullAndDistrict_Id(
            Long districtId,
            Pageable pageable);

    Page<Location> findByDeletedAtIsNullAndDistrict_Province_Id(
            Long provinceId,
            Pageable pageable);

    Page<Location> findByDeletedAtIsNullAndNameContainingIgnoreCaseAndDistrict_Id(
            String keyword,
            Long districtId,
            Pageable pageable);

    java.util.Optional<Location> findByIdAndDeletedAtIsNull(Long id);
}