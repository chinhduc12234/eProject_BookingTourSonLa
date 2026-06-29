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
import com.bookingtoursonla.dto.TourActivityRequest;
import com.bookingtoursonla.entity.Location;
import com.bookingtoursonla.entity.TourActivity;
import com.bookingtoursonla.entity.TourDay;
import com.bookingtoursonla.repository.BookingScheduleActivityRepository;
import com.bookingtoursonla.repository.LocationRepository;
import com.bookingtoursonla.repository.TourActivityRepository;
import com.bookingtoursonla.repository.TourDayRepository;

@Service
@Transactional
public class TourActivityServiceImpl implements TourActivityService {

    private final TourActivityRepository activityRepository;
    private final TourDayRepository tourDayRepository;
    private final LocationRepository locationRepository;
    private final BookingScheduleActivityRepository bookingScheduleActivityRepository;

    public TourActivityServiceImpl(
            TourActivityRepository activityRepository,
            TourDayRepository tourDayRepository,
            LocationRepository locationRepository,
            BookingScheduleActivityRepository bookingScheduleActivityRepository) {

        this.activityRepository = activityRepository;
        this.tourDayRepository = tourDayRepository;
        this.locationRepository = locationRepository;
        this.bookingScheduleActivityRepository = bookingScheduleActivityRepository;
    }

    @Override
    public List<TourActivityDto> getByTourDay(Long tourDayId) {

        return activityRepository
                .findByTourDayIdOrderBySortOrderAsc(tourDayId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public TourActivityDto create(Long tourDayId, TourActivityRequest request) {

        TourDay day = tourDayRepository.findById(tourDayId)
                .orElseThrow(() -> new RuntimeException("Tour day not found"));

        int nextOrder = activityRepository
                .findByTourDayIdOrderBySortOrderAsc(tourDayId)
                .size() + 1;

        TourActivity activity = new TourActivity();

        activity.setTourDay(day);
        activity.setTitle(request.getTitle());
        activity.setDescription(request.getDescription());
        activity.setStartTime(request.getStartTime());
        activity.setEndTime(request.getEndTime());
        activity.setLocationName(trimToNull(request.getLocationName()));

        activity.setSortOrder(
                request.getSortOrder() != null ? request.getSortOrder() : nextOrder);

        setLocation(activity, request.getLocationId());

        return mapToDto(activityRepository.save(activity));
    }

    @Override
    public TourActivityDto update(Long id, TourActivityRequest request) {

        TourActivity activity = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Activity not found"));

        activity.setTitle(request.getTitle());
        activity.setDescription(request.getDescription());
        activity.setStartTime(request.getStartTime());
        activity.setEndTime(request.getEndTime());
        activity.setLocationName(trimToNull(request.getLocationName()));

        if (request.getSortOrder() != null) {
            activity.setSortOrder(request.getSortOrder());
        }

        setLocation(activity, request.getLocationId());

        return mapToDto(activityRepository.save(activity));
    }

    @Override
    public void delete(Long id) {
        detachScheduleSnapshots(List.of(id));
        activityRepository.deleteById(id);
    }

    @Override
    public void replaceAll(Long tourDayId, List<TourActivityRequest> requests) {

        TourDay day = tourDayRepository.findById(tourDayId)
                .orElseThrow(() -> new RuntimeException("Tour day not found"));

        List<TourActivity> existingActivities = activityRepository
                .findByTourDayIdOrderBySortOrderAsc(tourDayId);
        Map<Integer, TourActivity> existingBySortOrder = existingActivities
                .stream()
                .filter(activity -> activity.getSortOrder() != null)
                .collect(Collectors.toMap(
                        TourActivity::getSortOrder,
                        Function.identity(),
                        (first, ignored) -> first));

        Set<Long> retainedIds = new HashSet<>();

        int index = 1;

        for (TourActivityRequest r : requests) {

            int sortOrder = r.getSortOrder() != null ? r.getSortOrder() : index;
            TourActivity a = existingBySortOrder.getOrDefault(sortOrder, new TourActivity());

            a.setTourDay(day);
            a.setTitle(r.getTitle());
            a.setDescription(r.getDescription());
            a.setStartTime(r.getStartTime());
            a.setEndTime(r.getEndTime());
            a.setLocationName(trimToNull(r.getLocationName()));
            a.setSortOrder(sortOrder);

            setLocation(a, r.getLocationId());

            TourActivity saved = activityRepository.save(a);
            if (saved.getId() != null) {
                retainedIds.add(saved.getId());
            }
            index++;
        }

        List<Long> removedIds = existingActivities
                .stream()
                .map(TourActivity::getId)
                .filter(id -> id != null && !retainedIds.contains(id))
                .toList();

        if (!removedIds.isEmpty()) {
            detachScheduleSnapshots(removedIds);
            activityRepository.deleteAllById(removedIds);
        }

        activityRepository.flush();
    }

    private void detachScheduleSnapshots(List<Long> activityIds) {

        if (activityIds == null || activityIds.isEmpty()) {
            return;
        }

        bookingScheduleActivityRepository.clearOriginalActivityReferences(activityIds);
        bookingScheduleActivityRepository.flush();
    }

    private void setLocation(
            TourActivity activity,
            Long locationId) {

        if (locationId == null) {

            activity.setLocation(null);
            return;
        }

        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new RuntimeException(
                        "Location not found"));

        activity.setLocation(location);
    }

    private TourActivityDto mapToDto(TourActivity a) {

        TourActivityDto dto = new TourActivityDto();

        dto.setId(a.getId());
        dto.setTitle(a.getTitle());
        dto.setDescription(a.getDescription());
        dto.setStartTime(a.getStartTime() != null ? a.getStartTime().toString() : null);
        dto.setEndTime(a.getEndTime() != null ? a.getEndTime().toString() : null);
        dto.setSortOrder(a.getSortOrder());

        if (a.getLocation() != null) {
            dto.setLocationId(a.getLocation().getId());
        }

        dto.setLocationName(resolveLocationName(a));

        return dto;
    }

    private String resolveLocationName(TourActivity activity) {
        String customName = trimToNull(activity.getLocationName());
        if (customName != null) {
            return customName;
        }
        return activity.getLocation() != null ? activity.getLocation().getName() : null;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
