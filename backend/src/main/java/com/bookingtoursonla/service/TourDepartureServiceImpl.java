package com.bookingtoursonla.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.bookingtoursonla.dto.TourDepartureDto;
import com.bookingtoursonla.dto.TourDepartureRequest;
import com.bookingtoursonla.entity.Tour;
import com.bookingtoursonla.entity.TourDeparture;
import com.bookingtoursonla.entity.enums.DepartureStatus;
import com.bookingtoursonla.repository.TourDepartureRepository;
import com.bookingtoursonla.repository.TourRepository;

import jakarta.transaction.Transactional;

@Service
public class TourDepartureServiceImpl implements TourDepartureService {

    private final TourDepartureRepository departureRepository;
    private final TourRepository tourRepository;

    public TourDepartureServiceImpl(
            TourDepartureRepository departureRepository,
            TourRepository tourRepository) {

        this.departureRepository = departureRepository;
        this.tourRepository = tourRepository;
    }

    // ===================== GET =====================

    @Override
    public List<TourDepartureDto> getByTourId(Long tourId) {
        return departureRepository.findByTourIdOrderByDepartureDateAsc(tourId)
                .stream()
                .map(this::map)
                .toList();
    }

    // ===================== CREATE =====================

    @Override
    public TourDepartureDto create(Long tourId, TourDepartureRequest request) {

        validateRequest(request);

        Tour tour = getTourOrThrow(tourId);

        // prevent duplicate date
        if (departureRepository.existsByTourIdAndDepartureDate(tourId, request.getDepartureDate())) {
            throw new RuntimeException("Departure date already exists");
        }

        TourDeparture d = new TourDeparture();
        d.setTour(tour);
        d.setDepartureDate(request.getDepartureDate());
        d.setMaxPeople(request.getMaxPeople());
        d.setCurrentPeople(defaultCurrent(request.getCurrentPeople()));

        d.setStatus(resolveStatus(
                request,
                d.getCurrentPeople(),
                d.getMaxPeople()));

        return map(departureRepository.save(d));
    }

    // ===================== UPDATE =====================

    @Override
    public TourDepartureDto update(Long id, TourDepartureRequest request) {

        validateRequest(request);

        TourDeparture d = departureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Departure not found"));

        // check duplicate date if changed
        if (!d.getDepartureDate().equals(request.getDepartureDate())) {
            if (departureRepository.existsByTourIdAndDepartureDate(
                    d.getTour().getId(),
                    request.getDepartureDate())) {
                throw new RuntimeException("Departure date already exists");
            }
        }

        d.setDepartureDate(request.getDepartureDate());
        d.setMaxPeople(request.getMaxPeople());
        d.setCurrentPeople(defaultCurrent(request.getCurrentPeople()));

        d.setStatus(resolveStatus(
                request,
                d.getCurrentPeople(),
                d.getMaxPeople()));

        return map(departureRepository.save(d));
    }

    // ===================== DELETE =====================

    @Override
    public void delete(Long id) {
        departureRepository.deleteById(id);
    }

    // ===================== REPLACE ALL =====================

    @Override
    @Transactional
    public void replaceAll(Long tourId, List<TourDepartureRequest> requests) {

        Tour tour = getTourOrThrow(tourId);

        departureRepository.deleteAllByTour_Id(tourId);
        departureRepository.flush();

        List<TourDeparture> list = new ArrayList<>();

        Set<LocalDate> seenDates = new HashSet<>();

        for (TourDepartureRequest r : requests) {

            validateRequest(r);

            if (!seenDates.add(r.getDepartureDate())) {
                throw new RuntimeException("Duplicate departure dates are not allowed");
            }

            TourDeparture d = new TourDeparture();
            d.setTour(tour);
            d.setDepartureDate(r.getDepartureDate());
            d.setMaxPeople(r.getMaxPeople());
            d.setCurrentPeople(defaultCurrent(r.getCurrentPeople()));
            d.setStatus(resolveStatus(
                    r,
                    d.getCurrentPeople(),
                    d.getMaxPeople()));

            list.add(d);
        }

        departureRepository.saveAll(list);
    }

    // ===================== HELPERS =====================

    private Tour getTourOrThrow(Long tourId) {
        return tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Tour not found"));
    }

    private void validateRequest(TourDepartureRequest r) {

        if (r.getDepartureDate() == null) {
            throw new RuntimeException("Departure date is required");
        }

        if (r.getMaxPeople() == null || r.getMaxPeople() <= 0) {
            throw new RuntimeException("Max people must be > 0");
        }

        if (r.getCurrentPeople() != null && r.getCurrentPeople() < 0) {
            throw new RuntimeException("Current people cannot be negative");
        }
    }

    private int defaultCurrent(Integer current) {
        return current == null ? 0 : current;
    }

    private DepartureStatus resolveStatus(
            TourDepartureRequest request,
            int current,
            int max) {

        if (request.getStatus() == DepartureStatus.CLOSED) {
            return DepartureStatus.CLOSED;
        }

        if (request.getStatus() == DepartureStatus.FULL || current >= max) {
            return DepartureStatus.FULL;
        }

        return DepartureStatus.OPEN;
    }

    private TourDepartureDto map(TourDeparture d) {

        TourDepartureDto dto = new TourDepartureDto();

        dto.setId(d.getId());
        dto.setDepartureDate(d.getDepartureDate());
        dto.setMaxPeople(d.getMaxPeople());
        dto.setCurrentPeople(d.getCurrentPeople());
        dto.setStatus(d.getStatus());

        return dto;
    }
}