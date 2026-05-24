package com.bookingtoursonla.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.bookingtoursonla.config.UploadPathUtils;
import com.bookingtoursonla.dto.CreateTourRequest;
import com.bookingtoursonla.dto.TourDto;
import com.bookingtoursonla.dto.UpdateTourRequest;
import com.bookingtoursonla.entity.Tour;
import com.bookingtoursonla.entity.User;
import com.bookingtoursonla.entity.enums.TourStatus;
import com.bookingtoursonla.repository.TourRepository;
import com.bookingtoursonla.repository.UserRepository;
import com.bookingtoursonla.security.SecurityUtils;

@Service
public class TourServiceImpl
                implements TourService {

        private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
                        "image/jpeg",
                        "image/png",
                        "image/webp",
                        "image/gif");

        private static final long MAX_TOUR_IMAGE_SIZE = 10 * 1024 * 1024;

        private static final int MAX_THUMBNAIL_LENGTH = 4000;

        private final TourRepository tourRepository;

        private final UserRepository userRepository;

        private final String uploadDir;

        public TourServiceImpl(
                        TourRepository tourRepository,
                        UserRepository userRepository,
                        @Value("${upload.dir:uploads}") String uploadDir) {

                this.tourRepository = tourRepository;
                this.userRepository = userRepository;
                this.uploadDir = uploadDir;
        }

        @Override
        public Page<TourDto> getAll(
                        int page,
                        int size,
                        String keyword,
                        String status,
                        String sortBy,
                        String direction) {

                String sortField = switch (sortBy) {

                        case "price" -> "price";

                        case "createdAt" -> "createdAt";

                        case "status" -> "status";

                        default -> "title";
                };

                Sort sort = direction.equalsIgnoreCase("desc")
                                ? Sort.by(sortField).descending()
                                : Sort.by(sortField).ascending();

                Pageable pageable = PageRequest.of(
                                page,
                                size,
                                sort);

                boolean hasKeyword = keyword != null
                                && !keyword.trim().isEmpty();

                boolean hasStatus = status != null
                                && !status.trim().isEmpty();

                Page<Tour> tours;

                if (hasKeyword && hasStatus) {

                        tours = tourRepository
                                        .findByDeletedAtIsNullAndTitleContainingIgnoreCaseAndStatus(
                                                        keyword.trim(),
                                                        TourStatus.valueOf(status.toUpperCase()),
                                                        pageable);

                } else if (hasKeyword) {

                        tours = tourRepository
                                        .findByDeletedAtIsNullAndTitleContainingIgnoreCase(
                                                        keyword.trim(),
                                                        pageable);

                } else if (hasStatus) {

                        tours = tourRepository
                                        .findByDeletedAtIsNullAndStatus(
                                                        TourStatus.valueOf(status.toUpperCase()),
                                                        pageable);

                } else {

                        tours = tourRepository
                                        .findByDeletedAtIsNull(
                                                        pageable);
                }

                return tours.map(this::mapToDto);
        }

        private String generateTourCode() {

                long count = tourRepository.count() + 1;

                return String.format("TOUR%04d", count);
        }

        @Override
        public TourDto create(
                        CreateTourRequest request) {

                if (tourRepository.existsBySlug(
                                request.getSlug().trim())) {

                        throw new RuntimeException(
                                        "Slug already exists");
                }

                String email = SecurityUtils.getCurrentUserEmail();

                User createdBy = userRepository
                                .findByEmail(email)
                                .orElseThrow(() -> new RuntimeException(
                                                "User not found"));

                Tour tour = new Tour();

                tour.setTourCode(
                                generateTourCode());

                tour.setTitle(
                                request.getTitle().trim());

                tour.setSlug(
                                request.getSlug().trim());

                tour.setThumbnail(
                                normalizeThumbnail(request.getThumbnail()));

                tour.setShortDescription(
                                request.getShortDescription());

                tour.setDescription(
                                request.getDescription());

                tour.setIncludedServices(
                                request.getIncludedServices());

                tour.setExcludedServices(
                                request.getExcludedServices());

                tour.setDurationDays(
                                request.getDurationDays());

                tour.setDurationNights(
                                request.getDurationNights());

                tour.setDepartureLocation(
                                request.getDepartureLocation());

                tour.setMaxPeople(
                                request.getMaxPeople());

                tour.setPrice(
                                request.getPrice());

                tour.setStatus(
                                request.getStatus());

                tour.setCreatedBy(
                                createdBy);

                Tour saved = tourRepository.save(tour);

                return mapToDto(saved);
        }

        @Override
        public TourDto update(
                        Long id,
                        UpdateTourRequest request) {

                Tour existing = tourRepository
                                .findByIdAndDeletedAtIsNull(id)
                                .orElseThrow(() -> new RuntimeException(
                                                "Tour not found"));

                if (tourRepository.existsBySlugAndIdNot(
                                request.getSlug().trim(),
                                id)) {

                        throw new RuntimeException(
                                        "Slug already exists");
                }

                existing.setTitle(
                                request.getTitle().trim());

                existing.setSlug(
                                request.getSlug().trim());

                existing.setThumbnail(
                                normalizeThumbnail(request.getThumbnail()));

                existing.setShortDescription(
                                request.getShortDescription());

                existing.setDescription(
                                request.getDescription());

                existing.setIncludedServices(
                                request.getIncludedServices());

                existing.setExcludedServices(
                                request.getExcludedServices());

                existing.setDurationDays(
                                request.getDurationDays());

                existing.setDurationNights(
                                request.getDurationNights());

                existing.setDepartureLocation(
                                request.getDepartureLocation());

                existing.setMaxPeople(
                                request.getMaxPeople());

                existing.setPrice(
                                request.getPrice());

                existing.setStatus(
                                request.getStatus());

                Tour updated = tourRepository.save(existing);

                return mapToDto(updated);
        }

        @Override
        public void delete(
                        Long id) {

                Tour existing = tourRepository
                                .findByIdAndDeletedAtIsNull(id)
                                .orElseThrow(() -> new RuntimeException(
                                                "Tour not found"));

                existing.setDeletedAt(
                                LocalDateTime.now());

                tourRepository.save(existing);
        }

        @Override
        public TourDto getById(
                        Long id) {

                Tour tour = tourRepository
                                .findByIdAndDeletedAtIsNull(id)
                                .orElseThrow(() -> new RuntimeException(
                                                "Tour not found"));

                return mapToDto(tour);
        }

        @Override
        public String uploadThumbnail(
                        MultipartFile file) {

                if (file == null || file.isEmpty()) {
                        throw new RuntimeException("Vui lòng chọn ảnh tour");
                }

                if (file.getSize() > MAX_TOUR_IMAGE_SIZE) {
                        throw new RuntimeException("Ảnh tour không được vượt quá 10MB");
                }

                String contentType = file.getContentType();

                if (contentType == null
                                || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
                        throw new RuntimeException("Ảnh tour chỉ hỗ trợ JPG, PNG, WEBP hoặc GIF");
                }

                try {
                        Path tourImageDir = UploadPathUtils.resolveUploadRoot(uploadDir)
                                        .resolve("tours");
                        Files.createDirectories(tourImageDir);

                        String filename = "tour-" + UUID.randomUUID()
                                        + getExtension(contentType);
                        Path target = tourImageDir.resolve(filename).normalize();

                        if (!target.startsWith(tourImageDir)) {
                                throw new RuntimeException("Tên file ảnh tour không hợp lệ");
                        }

                        file.transferTo(target);

                        return "/uploads/tours/" + filename;
                } catch (IOException ex) {
                        throw new RuntimeException("Không thể lưu ảnh tour");
                }
        }

        private String normalizeThumbnail(
                        String thumbnail) {

                if (thumbnail == null || thumbnail.trim().isEmpty()) {
                        return null;
                }

                String value = thumbnail.trim();

                if (value.startsWith("data:")) {
                        throw new RuntimeException(
                                        "Không thể lưu ảnh base64 vào tour. Vui lòng dùng nút Upload ảnh.");
                }

                if (value.length() > MAX_THUMBNAIL_LENGTH) {
                        throw new RuntimeException(
                                        "URL ảnh tour không được vượt quá 4000 ký tự. Vui lòng dùng Upload ảnh hoặc URL ảnh ngắn hơn.");
                }

                return value;
        }

        private String getExtension(
                        String contentType) {

                return switch (contentType.toLowerCase()) {
                        case "image/png" -> ".png";
                        case "image/webp" -> ".webp";
                        case "image/gif" -> ".gif";
                        default -> ".jpg";
                };
        }

        private TourDto mapToDto(
                        Tour tour) {

                TourDto dto = new TourDto();

                dto.setId(
                                tour.getId());

                dto.setTourCode(
                                tour.getTourCode());

                dto.setTitle(
                                tour.getTitle());

                dto.setSlug(
                                tour.getSlug());

                dto.setThumbnail(
                                tour.getThumbnail());

                dto.setShortDescription(
                                tour.getShortDescription());

                dto.setDescription(
                                tour.getDescription());

                dto.setIncludedServices(
                                tour.getIncludedServices());

                dto.setExcludedServices(
                                tour.getExcludedServices());

                dto.setDurationDays(
                                tour.getDurationDays());

                dto.setDurationNights(
                                tour.getDurationNights());

                dto.setDepartureLocation(
                                tour.getDepartureLocation());

                dto.setMaxPeople(
                                tour.getMaxPeople());

                dto.setPrice(
                                tour.getPrice());

                dto.setStatus(
                                tour.getStatus());

                dto.setCreatedAt(
                                tour.getCreatedAt());

                dto.setUpdatedAt(
                                tour.getUpdatedAt());

                if (tour.getCreatedBy() != null) {

                        dto.setCreatedBy(
                                        tour.getCreatedBy().getId());

                        dto.setCreatedByName(
                                        tour.getCreatedBy().getFullName());
                }

                return dto;
        }
}
