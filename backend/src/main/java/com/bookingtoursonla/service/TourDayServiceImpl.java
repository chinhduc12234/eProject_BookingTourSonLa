package com.bookingtoursonla.service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookingtoursonla.dto.TourActivityDto;
import com.bookingtoursonla.dto.TourDayDto;
import com.bookingtoursonla.dto.TourDayRequest;
import com.bookingtoursonla.entity.Tour;
import com.bookingtoursonla.entity.TourActivity;
import com.bookingtoursonla.entity.TourDay;
import com.bookingtoursonla.repository.BookingScheduleActivityRepository;
import com.bookingtoursonla.repository.TourActivityRepository;
import com.bookingtoursonla.repository.TourDayRepository;
import com.bookingtoursonla.repository.TourRepository;

@Service
@Transactional
public class TourDayServiceImpl implements TourDayService {

    private final TourDayRepository tourDayRepository;
    private final TourRepository tourRepository;
    private final TourActivityRepository activityRepository;
    private final BookingScheduleActivityRepository bookingScheduleActivityRepository;

    public TourDayServiceImpl(
            TourDayRepository tourDayRepository,
            TourRepository tourRepository,
            TourActivityRepository activityRepository,
            BookingScheduleActivityRepository bookingScheduleActivityRepository) {

        this.tourDayRepository = tourDayRepository;
        this.tourRepository = tourRepository;
        this.activityRepository = activityRepository;
        this.bookingScheduleActivityRepository = bookingScheduleActivityRepository;
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
                .orElseThrow(() -> new RuntimeException("Khong tim thay tour"));

        TourDay day = new TourDay();
        day.setTour(tour);
        day.setDayNumber(request.getDayNumber());
        day.setTitle(defaultTitle(request.getTitle(), request.getDayNumber()));
        day.setDescription(request.getDescription());

        return mapToDto(tourDayRepository.save(day));
    }

    @Override
    public TourDayDto update(Long tourId, Long dayId, TourDayRequest request) {

        TourDay day = tourDayRepository.findByIdAndTourId(dayId, tourId)
                .orElseThrow(() -> new RuntimeException("Tour day not found"));

        day.setDayNumber(request.getDayNumber());
        day.setTitle(defaultTitle(request.getTitle(), request.getDayNumber()));
        day.setDescription(request.getDescription());

        return mapToDto(tourDayRepository.save(day));
    }

    @Override
    public void delete(Long tourId, Long dayId) {

        TourDay day = tourDayRepository.findByIdAndTourId(dayId, tourId)
                .orElseThrow(() -> new RuntimeException("Tour day not found"));

        deleteActivitiesForDay(dayId);
        tourDayRepository.delete(day);
    }

    @Override
    public void replaceAll(Long tourId, List<TourDayRequest> requests) {

        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay tour"));

        if (requests == null || requests.isEmpty()) {
            throw new RuntimeException("Danh sach ngay tour khong duoc de trong");
        }

        List<TourDay> oldDays = tourDayRepository.findByTourIdOrderByDayNumberAsc(tourId);
        Map<Integer, TourDay> oldDaysByNumber = oldDays
                .stream()
                .filter(day -> day.getDayNumber() != null)
                .collect(Collectors.toMap(
                        TourDay::getDayNumber,
                        Function.identity(),
                        (first, ignored) -> first));

        Set<Long> retainedDayIds = new HashSet<>();
        int index = 1;

        for (TourDayRequest request : requests) {
            int dayNumber = request.getDayNumber() != null ? request.getDayNumber() : index;
            TourDay day = oldDaysByNumber.getOrDefault(dayNumber, new TourDay());

            day.setTour(tour);
            day.setDayNumber(dayNumber);
            day.setTitle(defaultTitle(request.getTitle(), dayNumber));
            day.setDescription(request.getDescription());

            TourDay saved = tourDayRepository.save(day);
            if (saved.getId() != null) {
                retainedDayIds.add(saved.getId());
            }
            index++;
        }

        for (TourDay oldDay : oldDays) {
            if (oldDay.getId() != null && !retainedDayIds.contains(oldDay.getId())) {
                deleteActivitiesForDay(oldDay.getId());
                tourDayRepository.delete(oldDay);
            }
        }

        tourDayRepository.flush();
    }

    private void deleteActivitiesForDay(Long dayId) {

        List<Long> activityIds = activityRepository
                .findByTourDayIdOrderBySortOrderAsc(dayId)
                .stream()
                .map(TourActivity::getId)
                .filter(id -> id != null)
                .toList();

        detachScheduleSnapshots(activityIds);
        activityRepository.deleteAllById(activityIds);
        activityRepository.flush();
    }

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

    private TourActivityDto mapActivityToDto(TourActivity activity) {

        TourActivityDto dto = new TourActivityDto();
        dto.setId(activity.getId());
        dto.setTitle(activity.getTitle());
        dto.setDescription(activity.getDescription());
        dto.setStartTime(activity.getStartTime() != null ? activity.getStartTime().toString() : null);
        dto.setEndTime(activity.getEndTime() != null ? activity.getEndTime().toString() : null);
        dto.setSortOrder(activity.getSortOrder());

        if (activity.getLocation() != null) {
            dto.setLocationId(activity.getLocation().getId());
        }

        dto.setLocationName(resolveActivityLocationName(activity));

        return dto;
    }

    private String resolveActivityLocationName(TourActivity activity) {
        String customName = trimToNull(activity.getLocationName());
        if (customName != null) {
            return customName;
        }
        return activity.getLocation() != null ? activity.getLocation().getName() : null;
    }

    private void detachScheduleSnapshots(List<Long> activityIds) {

        if (activityIds == null || activityIds.isEmpty()) {
            return;
        }

        bookingScheduleActivityRepository.clearOriginalActivityReferences(activityIds);
        bookingScheduleActivityRepository.flush();
    }

    private String defaultTitle(String title, Integer dayNumber) {
        String trimmed = trimToNull(title);
        return trimmed != null ? trimmed : "Ngay " + dayNumber;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
