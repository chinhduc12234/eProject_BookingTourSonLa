package com.bookingtoursonla.service;

import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import com.bookingtoursonla.dto.CreateTourRequest;
import com.bookingtoursonla.dto.TourDto;
import com.bookingtoursonla.dto.UpdateTourRequest;

public interface TourService {

        Page<TourDto> getAll(
                        int page,
                        int size,
                        String keyword,
                        String status,
                        String sortBy,
                        String direction);

        TourDto create(
                        CreateTourRequest request);

        TourDto update(
                        Long id,
                        UpdateTourRequest request);

        void delete(
                        Long id);

        TourDto getById(
                        Long id);

        String uploadThumbnail(
                        MultipartFile file);
}
