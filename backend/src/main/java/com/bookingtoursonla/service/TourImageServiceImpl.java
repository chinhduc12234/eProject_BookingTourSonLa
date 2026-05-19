package com.bookingtoursonla.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookingtoursonla.dto.ReplaceTourImagesRequest;
import com.bookingtoursonla.dto.TourImageDto;
import com.bookingtoursonla.entity.Tour;
import com.bookingtoursonla.entity.TourImage;
import com.bookingtoursonla.repository.TourImageRepository;
import com.bookingtoursonla.repository.TourRepository;

@Service
public class TourImageServiceImpl
        implements TourImageService {

    private final TourImageRepository imageRepository;
    private final TourRepository tourRepository;

    public TourImageServiceImpl(
            TourImageRepository imageRepository,
            TourRepository tourRepository) {
        this.imageRepository = imageRepository;
        this.tourRepository = tourRepository;
    }

    // ================= GET =================

    @Override
    public List<TourImageDto> getImages(
            Long tourId) {

        return imageRepository
                .findByTourIdOrderBySortOrderAsc(
                        tourId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    // ================= REPLACE =================

    @Override
    @Transactional
    public List<TourImageDto> replaceImages(
            Long tourId,
            ReplaceTourImagesRequest request) {

        Tour tour = getTourOrThrow(tourId);

        imageRepository.deleteByTourId(tourId);

        List<TourImage> images = request.getImages()
                .stream()
                .map(img -> TourImage.builder()
                        .tour(tour)
                        .imageUrl(
                                img.getImageUrl())
                        .isThumbnail(
                                img.getIsThumbnail())
                        .sortOrder(
                                img.getSortOrder())
                        .build())
                .toList();

        imageRepository.saveAll(images);

        ensureThumbnail(tourId);

        return getImages(tourId);
    }

    // ================= DELETE =================

    @Override
    @Transactional
    public void deleteImage(
            Long tourId,
            Long imageId) {

        TourImage image = imageRepository
                .findByIdAndTourId(
                        imageId,
                        tourId)
                .orElseThrow(() -> new RuntimeException(
                        "Image not found"));

        imageRepository.delete(image);

        ensureThumbnail(tourId);
    }

    // ================= THUMBNAIL =================

    @Override
    @Transactional
    public TourImageDto setThumbnail(
            Long tourId,
            Long imageId) {

        List<TourImage> images = imageRepository
                .findByTourIdOrderBySortOrderAsc(
                        tourId);

        images.forEach(i -> i.setIsThumbnail(false));

        TourImage image = imageRepository
                .findByIdAndTourId(
                        imageId,
                        tourId)
                .orElseThrow(() -> new RuntimeException(
                        "Image not found"));

        image.setIsThumbnail(true);

        return mapToDto(
                imageRepository.save(image));
    }

    // ================= INTERNAL =================

    private void ensureThumbnail(
            Long tourId) {

        List<TourImage> images = imageRepository
                .findByTourIdOrderBySortOrderAsc(
                        tourId);

        if (images.isEmpty()) {
            return;
        }

        boolean hasThumbnail = images.stream()
                .anyMatch(i -> Boolean.TRUE.equals(
                        i.getIsThumbnail()));

        if (!hasThumbnail) {

            images.get(0)
                    .setIsThumbnail(true);
        }
    }

    private Tour getTourOrThrow(
            Long tourId) {

        return tourRepository
                .findById(tourId)
                .orElseThrow(() -> new RuntimeException(
                        "Tour not found"));
    }

    // ================= MAPPER =================

    private TourImageDto mapToDto(
            TourImage img) {

        TourImageDto dto = new TourImageDto();

        dto.setId(img.getId());
        dto.setImageUrl(
                img.getImageUrl());
        dto.setIsThumbnail(
                img.getIsThumbnail());
        dto.setSortOrder(
                img.getSortOrder());

        return dto;
    }
}