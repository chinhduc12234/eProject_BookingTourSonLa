package com.bookingtoursonla.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.bookingtoursonla.dto.TourActivityDto;
import com.bookingtoursonla.dto.TourDayDto;
import com.bookingtoursonla.dto.TourDepartureDto;
import com.bookingtoursonla.dto.TourDetailResponse;
import com.bookingtoursonla.dto.TourDto;
import com.bookingtoursonla.dto.TourImageDto;
import com.bookingtoursonla.entity.Tour;
import com.bookingtoursonla.entity.TourActivity;
import com.bookingtoursonla.entity.TourDay;
import com.bookingtoursonla.entity.TourDeparture;
import com.bookingtoursonla.entity.TourImage;
import com.bookingtoursonla.repository.TourActivityRepository;
import com.bookingtoursonla.repository.TourDayRepository;
import com.bookingtoursonla.repository.TourDepartureRepository;
import com.bookingtoursonla.repository.TourImageRepository;
import com.bookingtoursonla.repository.TourRepository;

@Service
public class TourDetailServiceImpl implements TourDetailService {

    private final TourRepository tourRepository;
    private final TourImageRepository tourImageRepository;
    private final TourDayRepository tourDayRepository;
    private final TourActivityRepository tourActivityRepository;
    private final TourDepartureRepository tourDepartureRepository;

    public TourDetailServiceImpl(
            TourRepository tourRepository,
            TourImageRepository tourImageRepository,
            TourDayRepository tourDayRepository,
            TourActivityRepository tourActivityRepository,
            TourDepartureRepository tourDepartureRepository) {

        this.tourRepository = tourRepository;
        this.tourImageRepository = tourImageRepository;
        this.tourDayRepository = tourDayRepository;
        this.tourActivityRepository = tourActivityRepository;
        this.tourDepartureRepository = tourDepartureRepository;
    }

    @Override
    public TourDetailResponse getDetail(Long tourId) {

        Tour tour = tourRepository.findByIdAndDeletedAtIsNull(tourId)
                .orElseThrow(() -> new RuntimeException("Tour not found"));

        List<TourImage> images = tourImageRepository.findByTourIdOrderBySortOrderAsc(tourId);

        List<TourDay> days = tourDayRepository.findByTourIdOrderByDayNumberAsc(tourId);

        List<Long> dayIds = days.stream()
                .map(TourDay::getId)
                .toList();

        List<TourActivity> activities = dayIds.isEmpty()
                ? List.of()
                : tourActivityRepository.findByTourDayIdInOrderBySortOrderAsc(dayIds);

        Map<Long, List<TourActivity>> activityMap = activities.stream()
                .collect(Collectors.groupingBy(a -> a.getTourDay().getId()));

        List<TourDeparture> departures = tourDepartureRepository.findByTourIdOrderByDepartureDateAsc(tourId);

        TourDetailResponse response = new TourDetailResponse();

        response.setTour(mapTour(tour));
        response.setImages(mapImages(images));
        response.setDays(mapDays(days, activityMap));
        response.setDepartures(mapDepartures(departures));

        return response;
    }

    private TourDto mapTour(Tour t) {

        TourDto dto = new TourDto();

        dto.setId(t.getId());
        dto.setTourCode(t.getTourCode());
        dto.setTitle(t.getTitle());
        dto.setSlug(t.getSlug());
        dto.setThumbnail(t.getThumbnail());
        dto.setShortDescription(t.getShortDescription());
        dto.setDescription(t.getDescription());
        dto.setIncludedServices(t.getIncludedServices());
        dto.setExcludedServices(t.getExcludedServices());
        dto.setDurationDays(t.getDurationDays());
        dto.setDurationNights(t.getDurationNights());
        dto.setDepartureLocation(t.getDepartureLocation());
        dto.setMaxPeople(t.getMaxPeople());
        dto.setPrice(t.getPrice());
        dto.setStatus(t.getStatus());
        dto.setCreatedAt(t.getCreatedAt());
        dto.setUpdatedAt(t.getUpdatedAt());

        if (t.getCreatedBy() != null) {
            dto.setCreatedBy(t.getCreatedBy().getId());
            dto.setCreatedByName(t.getCreatedBy().getFullName());
        }

        return dto;
    }

    private List<TourImageDto> mapImages(List<TourImage> images) {
        return images.stream().map(img -> {
            TourImageDto dto = new TourImageDto();
            dto.setId(img.getId());
            dto.setImageUrl(img.getImageUrl());
            dto.setIsThumbnail(img.getIsThumbnail());
            dto.setSortOrder(img.getSortOrder());
            return dto;
        }).toList();
    }

    private List<TourDayDto> mapDays(List<TourDay> days,
            Map<Long, List<TourActivity>> activityMap) {

        return days.stream().map(day -> {

            TourDayDto dto = new TourDayDto();

            dto.setId(day.getId());
            dto.setDayNumber(day.getDayNumber());
            dto.setTitle(day.getTitle());
            dto.setDescription(day.getDescription());

            List<TourActivityDto> actDtos = activityMap.getOrDefault(day.getId(), List.of())
                    .stream()
                    .map(this::mapActivity)
                    .toList();

            dto.setActivities(actDtos);

            return dto;
        }).toList();
    }

    private TourActivityDto mapActivity(TourActivity a) {

        TourActivityDto dto = new TourActivityDto();

        dto.setId(a.getId());
        dto.setLocationId(a.getLocation() != null ? a.getLocation().getId() : null);
        dto.setLocationName(a.getLocation() != null ? a.getLocation().getName() : null);
        dto.setTitle(a.getTitle());
        dto.setDescription(a.getDescription());
        dto.setStartTime(a.getStartTime() != null ? a.getStartTime().toString() : null);
        dto.setEndTime(a.getEndTime() != null ? a.getEndTime().toString() : null);
        dto.setSortOrder(a.getSortOrder());

        return dto;
    }

    private List<TourDepartureDto> mapDepartures(List<TourDeparture> departures) {
        return departures.stream().map(d -> {

            TourDepartureDto dto = new TourDepartureDto();

            dto.setId(d.getId());
            dto.setDepartureDate(d.getDepartureDate());
            dto.setDepartureTime(d.getDepartureTime());
            dto.setBookingDeadline(d.getBookingDeadline());
            dto.setMaxPeople(d.getMaxPeople());
            dto.setCurrentPeople(d.getCurrentPeople());
            dto.setReservedPeople(d.getReservedPeople());
            dto.setAdultPrice(d.getAdultPrice());
            dto.setChildPrice(d.getChildPrice());
            dto.setIsPrivateDeparture(d.getIsPrivateDeparture());
            dto.setStatus(d.getStatus());

            return dto;
        }).toList();
    }
}