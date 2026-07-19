package com.bookingtoursonla.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookingtoursonla.dto.PublicTourDto;
import com.bookingtoursonla.dto.TourDepartureDto;
import com.bookingtoursonla.dto.TourDetailResponse;
import com.bookingtoursonla.entity.Tour;
import com.bookingtoursonla.entity.TourDeparture;
import com.bookingtoursonla.entity.enums.DepartureStatus;
import com.bookingtoursonla.entity.enums.TourStatus;
import com.bookingtoursonla.repository.TourDepartureRepository;
import com.bookingtoursonla.repository.TourRepository;

@Service
public class PublicTourServiceImpl implements PublicTourService {

    private final TourRepository tourRepository;

    private final TourDepartureRepository tourDepartureRepository;

    private final TourDetailService tourDetailService;

    public PublicTourServiceImpl(
            TourRepository tourRepository,
            TourDepartureRepository tourDepartureRepository,
            TourDetailService tourDetailService) {

        this.tourRepository = tourRepository;
        this.tourDepartureRepository = tourDepartureRepository;
        this.tourDetailService = tourDetailService;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PublicTourDto> getOpenTours(
            int page,
            int size,
            String keyword) {

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("createdAt").descending());

        String normalizedKeyword = keyword != null && !keyword.trim().isEmpty()
                ? keyword.trim()
                : null;
        Page<Tour> tours = tourRepository.findPublicBookableTours(
                normalizedKeyword,
                LocalDate.now(),
                LocalDateTime.now(),
                pageable);

        List<Long> tourIds = tours
                .stream()
                .map(Tour::getId)
                .toList();

        Map<Long, List<TourDeparture>> departureMap = tourIds.isEmpty()
                ? Map.of()
                : tourDepartureRepository
                        .findByTourIdInOrderByDepartureDateAsc(tourIds)
                        .stream()
                        .collect(Collectors.groupingBy(d -> d.getTour().getId()));

        return tours.map(tour -> mapTour(tour, departureMap.getOrDefault(tour.getId(), List.of())));
    }

    @Override
    @Transactional(readOnly = true)
    public TourDetailResponse getOpenTourDetail(Long id) {

        TourDetailResponse response = tourDetailService.getDetail(id);

        if (response.getTour().getStatus() != TourStatus.OPEN) {
            throw new RuntimeException("Tour hiện không mở bán");
        }

        List<TourDepartureDto> visibleDepartures = response.getDepartures()
                .stream()
                .filter(this::isBookableDeparture)
                .toList();

        if (visibleDepartures.isEmpty()) {
            throw new RuntimeException("Tour hiện không còn lịch khởi hành mở bán");
        }

        response.setDepartures(visibleDepartures);

        return response;
    }

    private PublicTourDto mapTour(
            Tour tour,
            List<TourDeparture> departures) {

        List<TourDeparture> bookableDepartures = departures
                .stream()
                .filter(this::isBookableDeparture)
                .toList();

        TourDeparture firstDeparture = bookableDepartures
                .stream()
                .min(Comparator.comparing(TourDeparture::getDepartureDate))
                .orElse(null);

        PublicTourDto dto = new PublicTourDto();

        dto.setId(tour.getId());
        dto.setTourCode(tour.getTourCode());
        dto.setTitle(tour.getTitle());
        dto.setSlug(tour.getSlug());
        dto.setThumbnail(tour.getThumbnail());
        dto.setShortDescription(tour.getShortDescription());
        dto.setDurationDays(tour.getDurationDays());
        dto.setDurationNights(tour.getDurationNights());
        dto.setDepartureLocation(tour.getDepartureLocation());
        dto.setMaxPeople(tour.getMaxPeople());
        dto.setPrice(tour.getPrice());
        dto.setStatus(tour.getStatus());
        dto.setDepartureCount(bookableDepartures.size());
        dto.setFirstDepartureDate(firstDeparture != null ? firstDeparture.getDepartureDate() : null);
        dto.setAvailableSeats(firstDeparture != null ? calculateAvailableSeats(firstDeparture) : 0);
        dto.setLowestAdultPrice(bookableDepartures
                .stream()
                .map(departure -> effectiveAdultPrice(tour, departure))
                .min(BigDecimal::compareTo)
                .orElse(tour.getPrice()));
        dto.setLowestChildPrice(bookableDepartures
                .stream()
                .map(departure -> effectiveChildPrice(tour, departure))
                .min(BigDecimal::compareTo)
                .orElse(tour.getPrice()));
        dto.setDepartures(bookableDepartures
                .stream()
                .limit(3)
                .map(this::mapDeparture)
                .toList());

        return dto;
    }

    private TourDepartureDto mapDeparture(TourDeparture departure) {

        TourDepartureDto dto = new TourDepartureDto();

        dto.setId(departure.getId());
        dto.setDepartureDate(departure.getDepartureDate());
        dto.setDepartureTime(departure.getDepartureTime());
        dto.setBookingDeadline(departure.getBookingDeadline());
        dto.setMaxPeople(departure.getMaxPeople());
        dto.setCurrentPeople(departure.getCurrentPeople());
        dto.setReservedPeople(departure.getReservedPeople());
        int availableSeats = calculateAvailableSeats(departure);
        dto.setAvailableSeats(availableSeats);
        dto.setAdultPrice(departure.getAdultPrice());
        dto.setChildPrice(departure.getChildPrice());
        dto.setIsPrivateDeparture(departure.getIsPrivateDeparture());
        dto.setStatus(
                departure.getStatus() != DepartureStatus.CLOSED && availableSeats > 0
                        ? DepartureStatus.OPEN
                        : departure.getStatus());

        return dto;
    }

    private boolean isBookableDeparture(TourDeparture departure) {

        return departure.getStatus() != DepartureStatus.CLOSED
                && departure.getDepartureDate() != null
                && !departure.getDepartureDate().isBefore(LocalDate.now())
                && (departure.getBookingDeadline() == null
                        || departure.getBookingDeadline().isAfter(LocalDateTime.now()))
                && calculateAvailableSeats(departure) > 0;
    }

    private boolean isBookableDeparture(TourDepartureDto departure) {

        return departure.getDepartureDate() != null
                && !departure.getDepartureDate().isBefore(LocalDate.now())
                && departure.getStatus() != DepartureStatus.CLOSED
                && departure.getAvailableSeats() != null
                && departure.getAvailableSeats() > 0
                && (departure.getBookingDeadline() == null
                        || departure.getBookingDeadline().isAfter(LocalDateTime.now()));
    }

    private BigDecimal effectiveAdultPrice(
            Tour tour,
            TourDeparture departure) {

        return departure.getAdultPrice() != null
                ? departure.getAdultPrice()
                : tour.getPrice();
    }

    private BigDecimal effectiveChildPrice(
            Tour tour,
            TourDeparture departure) {

        return departure.getChildPrice() != null
                ? departure.getChildPrice()
                : effectiveAdultPrice(tour, departure);
    }

    private int calculateAvailableSeats(TourDeparture departure) {

        return Math.max(0,
                nullToZero(departure.getMaxPeople())
                        - nullToZero(departure.getCurrentPeople())
                        - nullToZero(departure.getReservedPeople()));
    }

    private int nullToZero(Integer value) {

        return value == null ? 0 : value;
    }
}
