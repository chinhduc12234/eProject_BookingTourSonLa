package com.bookingtoursonla.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookingtoursonla.dto.TourActivityDto;
import com.bookingtoursonla.dto.TourDayDto;
import com.bookingtoursonla.dto.TourDayRequest;
import com.bookingtoursonla.entity.Tour;
import com.bookingtoursonla.entity.TourActivity;
import com.bookingtoursonla.entity.TourDay;
import com.bookingtoursonla.repository.TourActivityRepository;
import com.bookingtoursonla.repository.TourDayRepository;
import com.bookingtoursonla.repository.TourRepository;

@Service
@Transactional
public class TourDayServiceImpl implements TourDayService {

    private final TourDayRepository tourDayRepository;
    private final TourRepository tourRepository;
    private final TourActivityRepository activityRepository;

    public TourDayServiceImpl(
            TourDayRepository tourDayRepository,
            TourRepository tourRepository,
            TourActivityRepository activityRepository) {

        this.tourDayRepository = tourDayRepository;
        this.tourRepository = tourRepository;
        this.activityRepository = activityRepository;
    }

    @Override
    public List<TourDayDto> getByTourId(Long tourId) {
        return tourDayRepository.findByTourIdOrderByDayNumberAsc(tourId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public TourDayDto create(Long tourId, TourDayRequest request) {

        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Tour not found"));

        TourDay day = new TourDay();
        day.setTour(tour);
        day.setDayNumber(request.getDayNumber());

        day.setTitle(
                request.getTitle() != null && !request.getTitle().trim().isEmpty()
                        ? request.getTitle().trim()
                        : "Ngày " + request.getDayNumber());

        day.setDescription(request.getDescription());

        return mapToDto(tourDayRepository.save(day));
    }

    @Override
    public TourDayDto update(Long tourId, Long dayId, TourDayRequest request) {

        TourDay day = tourDayRepository.findByIdAndTourId(dayId, tourId)
                .orElseThrow(() -> new RuntimeException("Tour day not found"));

        day.setDayNumber(request.getDayNumber());
        day.setTitle(request.getTitle());
        day.setDescription(request.getDescription());

        return mapToDto(tourDayRepository.save(day));
    }

    @Override
    public void delete(Long tourId, Long dayId) {

        TourDay day = tourDayRepository.findByIdAndTourId(dayId, tourId)
                .orElseThrow(() -> new RuntimeException("Tour day not found"));

        activityRepository.deleteByTourDayId(dayId);
        tourDayRepository.delete(day);
    }

    // ===================== FIX CHÍNH =====================
    @Override
    public void replaceAll(Long tourId, List<TourDayRequest> requests) {

        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Tour not found"));

        if (requests == null || requests.isEmpty()) {
            throw new RuntimeException("Tour days request is empty");
        }

        // 1. DELETE ACTIVITIES TRƯỚC
        List<TourDay> oldDays = tourDayRepository.findByTourIdOrderByDayNumberAsc(tourId);

        for (TourDay d : oldDays) {
            activityRepository.deleteByTourDayId(d.getId());
        }

        activityRepository.flush();

        // 2. DELETE DAYS (FIX QUAN TRỌNG)
        tourDayRepository.deleteByTourId(tourId);
        tourDayRepository.flush();

        // 3. INSERT NEW DAYS
        List<TourDay> newDays = new ArrayList<>();

        int index = 1;

        for (TourDayRequest r : requests) {

            TourDay day = new TourDay();
            day.setTour(tour);

            day.setDayNumber(
                    r.getDayNumber() != null ? r.getDayNumber() : index);

            day.setTitle(
                    (r.getTitle() != null && !r.getTitle().trim().isEmpty())
                            ? r.getTitle().trim()
                            : "Ngày " + index);

            day.setDescription(r.getDescription());

            newDays.add(day);
            index++;
        }

        tourDayRepository.saveAll(newDays);
    }

    // ===================== DTO =====================
    private TourDayDto mapToDto(TourDay day) {

        TourDayDto dto = new TourDayDto();
        dto.setId(day.getId());
        dto.setDayNumber(day.getDayNumber());
        dto.setTitle(day.getTitle());
        dto.setDescription(day.getDescription());

        List<TourActivityDto> activities = activityRepository.findByTourDayIdOrderBySortOrderAsc(day.getId())
                .stream()
                .map(this::mapActivityToDto)
                .toList();

        dto.setActivities(activities);

        return dto;
    }

    private TourActivityDto mapActivityToDto(TourActivity a) {

        TourActivityDto dto = new TourActivityDto();
        dto.setId(a.getId());
        dto.setTitle(a.getTitle());
        dto.setDescription(a.getDescription());
        dto.setStartTime(a.getStartTime() != null ? a.getStartTime().toString() : null);
        dto.setEndTime(a.getEndTime() != null ? a.getEndTime().toString() : null);
        dto.setSortOrder(a.getSortOrder());

        if (a.getLocation() != null) {
            dto.setLocationId(a.getLocation().getId());
            dto.setLocationName(a.getLocation().getName());
        }

        return dto;
    }
}