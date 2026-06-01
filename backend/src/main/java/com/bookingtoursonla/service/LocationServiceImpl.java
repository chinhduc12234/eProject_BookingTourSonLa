package com.bookingtoursonla.service;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.bookingtoursonla.dto.LocationDto;
import com.bookingtoursonla.entity.District;
import com.bookingtoursonla.entity.Location;
import com.bookingtoursonla.repository.DistrictRepository;
import com.bookingtoursonla.repository.LocationRepository;

@Service
public class LocationServiceImpl
        implements LocationService {

    private final LocationRepository locationRepository;

    private final DistrictRepository districtRepository;

    public LocationServiceImpl(
            LocationRepository locationRepository,
            DistrictRepository districtRepository) {

        this.locationRepository = locationRepository;

        this.districtRepository = districtRepository;
    }

    @Override
    public Page<LocationDto> getAll(
            int page,
            int size,
            String keyword,
            Long districtId,
            Long provinceId,
            String sortBy,
            String direction) {

        String sortField = switch (sortBy) {

            case "district" -> "district.name";

            case "province" -> "district.province.name";

            default -> "name";
        };

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortField).descending()
                : Sort.by(sortField).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Location> locations;

        boolean hasKeyword = keyword != null
                && !keyword.trim().isEmpty();

        boolean hasDistrict = districtId != null;

        boolean hasProvince = provinceId != null;

        if (hasKeyword && hasDistrict) {

            locations = locationRepository
                    .findByDeletedAtIsNullAndNameContainingIgnoreCaseAndDistrict_Id(
                            keyword.trim(),
                            districtId,
                            pageable);

        } else if (hasKeyword && hasProvince) {

            locations = locationRepository
                    .findByDeletedAtIsNullAndNameContainingIgnoreCaseAndDistrict_Province_Id(
                            keyword.trim(),
                            provinceId,
                            pageable);

        } else if (hasDistrict) {

            locations = locationRepository
                    .findByDeletedAtIsNullAndDistrict_Id(
                            districtId,
                            pageable);

        } else if (hasProvince) {

            locations = locationRepository
                    .findByDeletedAtIsNullAndDistrict_Province_Id(
                            provinceId,
                            pageable);

        } else if (hasKeyword) {

            locations = locationRepository
                    .findByDeletedAtIsNullAndNameContainingIgnoreCase(
                            keyword.trim(),
                            pageable);

        } else {

            locations = locationRepository
                    .findByDeletedAtIsNull(
                            pageable);
        }

        return locations.map(this::mapToDto);
    }

    @Override
    public LocationDto create(LocationDto dto) {

        District district = districtRepository
                .findByIdAndDeletedFalse(
                        dto.getDistrictId())
                .orElseThrow(() -> new RuntimeException(
                        "District not found"));

        Location location = new Location();

        location.setName(dto.getName().trim());

        location.setDescription(
                dto.getDescription());

        location.setAddress(
                dto.getAddress());

        location.setLatitude(
                dto.getLatitude());

        location.setLongitude(
                dto.getLongitude());

        location.setImage(
                dto.getImage());

        location.setActive(
                dto.getActive() != null
                        ? dto.getActive()
                        : true);

        location.setDistrict(district);

        Location saved = locationRepository.save(location);

        return mapToDto(saved);
    }

    @Override
    public LocationDto update(
            Long id,
            LocationDto dto) {

        Location existing = locationRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException(
                        "Location not found"));

        District district = districtRepository
                .findByIdAndDeletedFalse(
                        dto.getDistrictId())
                .orElseThrow(() -> new RuntimeException(
                        "District not found"));

        existing.setName(dto.getName().trim());

        existing.setDescription(
                dto.getDescription());

        existing.setAddress(
                dto.getAddress());

        existing.setLatitude(
                dto.getLatitude());

        existing.setLongitude(
                dto.getLongitude());

        existing.setImage(
                dto.getImage());

        existing.setActive(
                dto.getActive() != null
                        ? dto.getActive()
                        : existing.getActive());

        existing.setDistrict(district);

        Location updated = locationRepository.save(existing);

        return mapToDto(updated);
    }

    @Override
    public void delete(Long id) {

        Location existing = locationRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException(
                        "Location not found"));

        existing.setDeletedAt(
                LocalDateTime.now());

        locationRepository.save(existing);
    }

    private LocationDto mapToDto(
            Location location) {

        LocationDto dto = new LocationDto();

        dto.setId(location.getId());

        dto.setName(location.getName());

        dto.setDescription(
                location.getDescription());

        dto.setAddress(
                location.getAddress());

        dto.setLatitude(
                location.getLatitude());

        dto.setLongitude(
                location.getLongitude());

        dto.setImage(
                location.getImage());

        dto.setActive(
                location.getActive());

        dto.setDistrictId(
                location.getDistrict().getId());

        dto.setDistrictName(
                location.getDistrict().getName());

        dto.setProvinceId(
                location.getDistrict()
                        .getProvince()
                        .getId());

        dto.setProvinceName(
                location.getDistrict()
                        .getProvince()
                        .getName());

        return dto;
    }
}
