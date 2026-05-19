package com.bookingtoursonla.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookingtoursonla.dto.TourActivityDto;
import com.bookingtoursonla.dto.TourActivityRequest;
import com.bookingtoursonla.entity.Location;
import com.bookingtoursonla.entity.TourActivity;
import com.bookingtoursonla.entity.TourDay;
import com.bookingtoursonla.repository.LocationRepository;
import com.bookingtoursonla.repository.TourActivityRepository;
import com.bookingtoursonla.repository.TourDayRepository;

@Service
@Transactional
public class TourActivityServiceImpl implements TourActivityService {

    private final TourActivityRepository activityRepository;
    private final TourDayRepository tourDayRepository;
    private final LocationRepository locationRepository;

    public TourActivityServiceImpl(
            TourActivityRepository activityRepository,
            TourDayRepository tourDayRepository,
            LocationRepository locationRepository) {

        this.activityRepository = activityRepository;
        this.tourDayRepository = tourDayRepository;
        this.locationRepository = locationRepository;
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

        if (request.getSortOrder() != null) {
            activity.setSortOrder(request.getSortOrder());
        }

        setLocation(activity, request.getLocationId());

        return mapToDto(activityRepository.save(activity));
    }

    @Override
    public void delete(Long id) {
        activityRepository.deleteById(id);
    }

    @Override
    public void replaceAll(Long tourDayId, List<TourActivityRequest> requests) {

        TourDay day = tourDayRepository.findById(tourDayId)
                .orElseThrow(() -> new RuntimeException("Tour day not found"));

        activityRepository.deleteByTourDayId(tourDayId);

        List<TourActivity> activities = new ArrayList<>();

        int index = 1;

        for (TourActivityRequest r : requests) {

            TourActivity a = new TourActivity();

            a.setTourDay(day);
            a.setTitle(r.getTitle());
            a.setDescription(r.getDescription());
            a.setStartTime(r.getStartTime());
            a.setEndTime(r.getEndTime());

            a.setSortOrder(r.getSortOrder() != null ? r.getSortOrder() : index++);

            setLocation(a, r.getLocationId());

            activities.add(a);
        }

        activityRepository.saveAll(activities);
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
            dto.setLocationName(a.getLocation().getName());
        }

        return dto;
    }
}