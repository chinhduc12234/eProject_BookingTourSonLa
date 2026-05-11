package com.bookingtoursonla.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.bookingtoursonla.dto.ProvinceDto;
import com.bookingtoursonla.entity.Province;
import com.bookingtoursonla.repository.ProvinceRepository;

@Service
public class ProvinceServiceImpl implements ProvinceService {

    private final ProvinceRepository provinceRepository;

    public ProvinceServiceImpl(ProvinceRepository provinceRepository) {
        this.provinceRepository = provinceRepository;
    }

    // ================= GET ALL =================

    @Override
    public Page<ProvinceDto> getAll(int page, int size) {

        Pageable pageable = PageRequest.of(page, size);

        return provinceRepository
                .findByDeletedFalse(pageable)
                .map(this::mapToDto);
    }

    // ================= GET ALL NO PAGINATION =================

    @Override
    public List<ProvinceDto> getAllNoPaging() {

        return provinceRepository
                .findAll()
                .stream()
                .filter(province -> !province.getDeleted())
                .map(this::mapToDto)
                .toList();
    }

    // ================= CREATE =================

    @Override
    public ProvinceDto create(ProvinceDto dto) {

        String provinceName = dto.getName().trim();

        if (provinceRepository
                .existsByNameIgnoreCaseAndDeletedFalse(provinceName)) {

            throw new RuntimeException(
                    "Province name already exists");
        }

        Province province = new Province();

        province.setName(provinceName);

        Province saved = provinceRepository.save(province);

        return mapToDto(saved);
    }

    // ================= UPDATE =================

    @Override
    public ProvinceDto update(Long id, ProvinceDto dto) {

        Province existing = provinceRepository
                .findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Province not found"));

        String newName = dto.getName().trim();

        if (!existing.getName().equalsIgnoreCase(newName)
                && provinceRepository
                        .existsByNameIgnoreCaseAndDeletedFalse(newName)) {

            throw new RuntimeException(
                    "Province name already exists");
        }

        existing.setName(newName);

        Province updated = provinceRepository.save(existing);

        return mapToDto(updated);
    }

    // ================= DELETE =================

    @Override
    public void delete(Long id) {

        Province existing = provinceRepository
                .findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Province not found"));

        existing.setDeleted(true);

        provinceRepository.save(existing);
    }

    // ================= DTO MAPPER =================

    private ProvinceDto mapToDto(Province province) {

        ProvinceDto dto = new ProvinceDto();

        dto.setId(province.getId());

        dto.setName(province.getName());

        return dto;
    }
}