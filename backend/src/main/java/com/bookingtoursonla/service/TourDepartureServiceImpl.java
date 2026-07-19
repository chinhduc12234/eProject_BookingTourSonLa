package com.bookingtoursonla.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
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

    @Override
    public List<TourDepartureDto> getByTourId(Long tourId) {
        return departureRepository.findByTourIdOrderByDepartureDateAsc(tourId)
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    @Transactional
    public TourDepartureDto create(Long tourId, TourDepartureRequest request) {
        validateRequest(request);

        Tour tour = getTourOrThrow(tourId);
        TourDeparture departure = createOrRestoreDeparture(tour, request);
        applyRequest(departure, request);

        return map(departureRepository.save(departure));
    }

    @Override
    @Transactional
    public TourDepartureDto update(Long id, TourDepartureRequest request) {
        validateRequest(request);

        TourDeparture departure = departureRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new RuntimeException("Departure not found"));

        validateUniqueDateForUpdate(departure, request.getDepartureDate());
        applyRequest(departure, request);

        return map(departureRepository.save(departure));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        TourDeparture departure = departureRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new RuntimeException("Departure not found"));

        softDelete(departure);
        departureRepository.save(departure);
    }

    @Override
    @Transactional
    public void syncAll(Long tourId, List<TourDepartureRequest> requests) {
        Tour tour = getTourOrThrow(tourId);
        List<TourDepartureRequest> safeRequests = requests == null ? List.of() : requests;

        validateNoDuplicateIdsOrDates(safeRequests);

        List<TourDeparture> existing = departureRepository.findAllByTourIdIncludingDeleted(tourId);
        Map<Long, TourDeparture> existingById = new HashMap<>();
        Set<Long> retainedIds = new HashSet<>();

        for (TourDeparture departure : existing) {
            existingById.put(departure.getId(), departure);
        }

        for (TourDepartureRequest request : safeRequests) {
            validateRequest(request);

            TourDeparture departure;
            if (request.getId() != null) {
                departure = existingById.get(request.getId());
                if (departure == null) {
                    throw new RuntimeException("Departure does not belong to this tour");
                }
                if (departure.getDeletedAt() != null) {
                    throw new RuntimeException("Deleted departure cannot be updated");
                }
                validateUniqueDateForUpdate(departure, request.getDepartureDate());
            } else {
                departure = createOrRestoreDeparture(tour, request);
            }

            applyRequest(departure, request);
            departureRepository.save(departure);
            retainedIds.add(departure.getId());
        }

        for (TourDeparture departure : existing) {
            if (departure.getDeletedAt() == null && !retainedIds.contains(departure.getId())) {
                softDelete(departure);
                departureRepository.save(departure);
            }
        }
    }

    private Tour getTourOrThrow(Long tourId) {
        return tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Kh\u00f4ng t\u00ecm th\u1ea5y tour"));
    }

    private TourDeparture createOrRestoreDeparture(Tour tour, TourDepartureRequest request) {
        return departureRepository.findAnyByTourIdAndDepartureDate(tour.getId(), request.getDepartureDate())
                .map(existing -> {
                    if (existing.getDeletedAt() == null) {
                        throw new RuntimeException("Ng\u00e0y kh\u1edfi h\u00e0nh \u0111\u00e3 t\u1ed3n t\u1ea1i");
                    }
                    existing.setDeletedAt(null);
                    existing.setTour(tour);
                    return existing;
                })
                .orElseGet(() -> {
                    TourDeparture departure = new TourDeparture();
                    departure.setTour(tour);
                    return departure;
                });
    }

    private void applyRequest(TourDeparture departure, TourDepartureRequest request) {
        departure.setDepartureDate(request.getDepartureDate());
        departure.setBookingDeadline(request.getBookingDeadline());
        departure.setDepartureTime(request.getDepartureTime());
        departure.setMaxPeople(request.getMaxPeople());
        departure.setCurrentPeople(defaultCurrent(request.getCurrentPeople()));
        departure.setReservedPeople(defaultZero(request.getReservedPeople()));
        departure.setAdultPrice(request.getAdultPrice());
        departure.setChildPrice(request.getChildPrice());
        departure.setIsPrivateDeparture(defaultFalse(request.getIsPrivateDeparture()));
        departure.setDeletedAt(null);

        departure.setStatus(resolveStatus(
                request,
                departure.getCurrentPeople(),
                departure.getMaxPeople()));
    }

    private void softDelete(TourDeparture departure) {
        departure.setDeletedAt(LocalDateTime.now());
        departure.setStatus(DepartureStatus.CLOSED);
    }

    private void validateRequest(TourDepartureRequest request) {
        if (request.getDepartureDate() == null) {
            throw new RuntimeException("Ng\u00e0y kh\u1edfi h\u00e0nh kh\u00f4ng \u0111\u01b0\u1ee3c \u0111\u1ec3 tr\u1ed1ng");
        }

        if (request.getMaxPeople() == null || request.getMaxPeople() <= 0) {
            throw new RuntimeException("S\u1ed1 kh\u00e1ch t\u1ed1i \u0111a ph\u1ea3i l\u1edbn h\u01a1n 0");
        }

        if (request.getCurrentPeople() != null && request.getCurrentPeople() < 0) {
            throw new RuntimeException("S\u1ed1 kh\u00e1ch \u0111\u00e3 x\u00e1c nh\u1eadn kh\u00f4ng \u0111\u01b0\u1ee3c \u00e2m");
        }

        if (request.getReservedPeople() != null && request.getReservedPeople() < 0) {
            throw new RuntimeException("S\u1ed1 ch\u1ed7 \u0111ang gi\u1eef kh\u00f4ng \u0111\u01b0\u1ee3c \u00e2m");
        }

        if (request.getStatus() == null || request.getStatus() == DepartureStatus.OPEN) {
            if (request.getDepartureDate().isBefore(LocalDate.now())) {
                throw new RuntimeException(
                        "Lich khoi hanh dang mo ban phai co ngay khoi hanh tu hom nay tro di");
            }

            if (request.getBookingDeadline() != null
                    && !request.getBookingDeadline().isAfter(LocalDateTime.now())) {
                throw new RuntimeException(
                        "Han dat cua lich dang mo ban phai lon hon thoi diem hien tai");
            }
        }
    }

    private void validateNoDuplicateIdsOrDates(List<TourDepartureRequest> requests) {
        Set<Long> seenIds = new HashSet<>();
        Set<LocalDate> seenDates = new HashSet<>();

        for (TourDepartureRequest request : requests) {
            if (request.getId() != null && !seenIds.add(request.getId())) {
                throw new RuntimeException("M\u00e3 l\u1ecbch kh\u1edfi h\u00e0nh b\u1ecb tr\u00f9ng");
            }

            if (request.getDepartureDate() != null && !seenDates.add(request.getDepartureDate())) {
                throw new RuntimeException("Ng\u00e0y kh\u1edfi h\u00e0nh b\u1ecb tr\u00f9ng");
            }
        }
    }

    private void validateUniqueDateForUpdate(TourDeparture departure, LocalDate departureDate) {
        if (!departure.getDepartureDate().equals(departureDate)
                && departureRepository.existsByTourIdAndDepartureDateAndIdNot(
                        departure.getTour().getId(),
                        departureDate,
                        departure.getId())) {
            throw new RuntimeException("Ng\u00e0y kh\u1edfi h\u00e0nh \u0111\u00e3 t\u1ed3n t\u1ea1i");
        }
    }

    private int defaultCurrent(Integer current) {
        return current == null ? 0 : current;
    }

    private int defaultZero(Integer value) {
        return value == null ? 0 : value;
    }

    private boolean defaultFalse(Boolean value) {
        return value != null && value;
    }

    private DepartureStatus resolveStatus(
            TourDepartureRequest request,
            int current,
            int max) {

        if (request.getStatus() == DepartureStatus.CLOSED) {
            return DepartureStatus.CLOSED;
        }

        if (current >= max) {
            return DepartureStatus.FULL;
        }

        return DepartureStatus.OPEN;
    }

    private TourDepartureDto map(TourDeparture departure) {
        TourDepartureDto dto = new TourDepartureDto();

        dto.setId(departure.getId());
        dto.setDepartureDate(departure.getDepartureDate());
        dto.setBookingDeadline(departure.getBookingDeadline());
        dto.setDepartureTime(departure.getDepartureTime());
        dto.setMaxPeople(departure.getMaxPeople());
        dto.setCurrentPeople(departure.getCurrentPeople());
        dto.setReservedPeople(departure.getReservedPeople());
        dto.setAvailableSeats(Math.max(
                0,
                defaultZero(departure.getMaxPeople())
                        - defaultZero(departure.getCurrentPeople())
                        - defaultZero(departure.getReservedPeople())));
        dto.setAdultPrice(departure.getAdultPrice());
        dto.setChildPrice(departure.getChildPrice());
        dto.setIsPrivateDeparture(departure.getIsPrivateDeparture());
        dto.setStatus(departure.getStatus());

        return dto;
    }
}
