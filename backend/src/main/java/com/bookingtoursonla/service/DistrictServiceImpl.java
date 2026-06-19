package com.bookingtoursonla.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.bookingtoursonla.dto.DistrictDto;
import com.bookingtoursonla.entity.District;
import com.bookingtoursonla.entity.Province;
import com.bookingtoursonla.repository.DistrictRepository;
import com.bookingtoursonla.repository.ProvinceRepository;

@Service
public class DistrictServiceImpl implements DistrictService {

    private final DistrictRepository districtRepository;
    private final ProvinceRepository provinceRepository;

    public DistrictServiceImpl(
            DistrictRepository districtRepository,
            ProvinceRepository provinceRepository) {
        this.districtRepository = districtRepository;
        this.provinceRepository = provinceRepository;
    }

    @Override
    public Page<DistrictDto> getAll(
            int page,
            int size,
            String keyword,
            Long provinceId,
            String sortBy,
            String direction) {

        String sortField = switch (sortBy) {
            case "province" -> "province.name";
            default -> "name";
        };

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortField).descending()
                : Sort.by(sortField).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<District> districts;

        boolean hasKeyword = keyword != null
                && !keyword.trim().isEmpty();

        boolean hasProvince = provinceId != null;

        if (hasKeyword && hasProvince) {

            districts = districtRepository
                    .findByDeletedFalseAndNameContainingIgnoreCaseAndProvince_Id(
                            keyword.trim(),
                            provinceId,
                            pageable);

        } else if (hasKeyword) {

            districts = districtRepository
                    .findByDeletedFalseAndNameContainingIgnoreCase(
                            keyword.trim(),
                            pageable);

        } else if (hasProvince) {

            districts = districtRepository
                    .findByDeletedFalseAndProvince_Id(
                            provinceId,
                            pageable);

        } else {

            districts = districtRepository
                    .findByDeletedFalse(pageable);
        }

        return districts.map(this::mapToDto);
    }

    @Override
    public DistrictDto create(DistrictDto dto) {

        Province province = provinceRepository
                .findByIdAndDeletedFalse(dto.getProvinceId())
                .orElseThrow(() -> new RuntimeException("Province not found"));

        String districtName = dto.getName().trim();

        boolean exists = districtRepository
                .existsByNameIgnoreCaseAndProvince_IdAndDeletedFalse(
                        districtName,
                        province.getId());

        if (exists) {
            throw new RuntimeException(
                    "T\u00ean huy\u1ec7n \u0111\u00e3 t\u1ed3n t\u1ea1i trong t\u1ec9nh n\u00e0y");
        }

        District district = new District();

        district.setName(districtName);
        district.setProvince(province);

        District saved = districtRepository.save(district);

        return mapToDto(saved);
    }

    @Override
    public DistrictDto update(Long id, DistrictDto dto) {

        District existing = districtRepository
                .findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("District not found"));

        Province province = provinceRepository
                .findByIdAndDeletedFalse(dto.getProvinceId())
                .orElseThrow(() -> new RuntimeException("Province not found"));

        String newName = dto.getName().trim();

        boolean duplicate = !existing.getName()
                .equalsIgnoreCase(newName)
                || !existing.getProvince().getId()
                        .equals(province.getId());

        if (duplicate &&
                districtRepository
                        .existsByNameIgnoreCaseAndProvince_IdAndDeletedFalse(
                                newName,
                                province.getId())) {

            throw new RuntimeException(
                    "T\u00ean huy\u1ec7n \u0111\u00e3 t\u1ed3n t\u1ea1i trong t\u1ec9nh n\u00e0y");
        }

        existing.setName(newName);
        existing.setProvince(province);

        District updated = districtRepository.save(existing);

        return mapToDto(updated);
    }

    @Override
    public void delete(Long id) {

        District existing = districtRepository
                .findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("District not found"));

        existing.setDeleted(true);

        districtRepository.save(existing);
    }

    private DistrictDto mapToDto(District district) {

        DistrictDto dto = new DistrictDto();

        dto.setId(district.getId());

        dto.setName(district.getName());

        dto.setProvinceId(
                district.getProvince().getId());

        dto.setProvinceName(
                district.getProvince().getName());

        return dto;
    }

    @Override
    public List<DistrictDto> getAllNoPaging() {

        return districtRepository
                .findByDeletedFalse()
                .stream()
                .map(this::mapToDto)
                .toList();
    }
}
