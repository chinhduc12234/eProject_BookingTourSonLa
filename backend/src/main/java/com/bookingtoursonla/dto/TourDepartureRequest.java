package com.bookingtoursonla.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.bookingtoursonla.entity.enums.DepartureStatus;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TourDepartureRequest {

    private Long id;

    @NotNull(message = "Departure date is required")
    private LocalDate departureDate;

    private LocalDateTime bookingDeadline;

    private LocalTime departureTime;

    @NotNull(message = "Max people is required")
    @Min(value = 1)
    private Integer maxPeople;

    @Min(value = 0)
    private Integer currentPeople;

    @Min(value = 0)
    private Integer reservedPeople;

    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal adultPrice;

    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal childPrice;

    private Boolean isPrivateDeparture;

    private DepartureStatus status;
}
