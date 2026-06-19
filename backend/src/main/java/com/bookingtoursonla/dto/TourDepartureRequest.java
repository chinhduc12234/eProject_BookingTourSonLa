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

    @NotNull(message = "Ng\u00e0y kh\u1edfi h\u00e0nh kh\u00f4ng \u0111\u01b0\u1ee3c \u0111\u1ec3 tr\u1ed1ng")
    private LocalDate departureDate;

    private LocalDateTime bookingDeadline;

    private LocalTime departureTime;

    @NotNull(message = "S\u1ed1 kh\u00e1ch t\u1ed1i \u0111a kh\u00f4ng \u0111\u01b0\u1ee3c \u0111\u1ec3 tr\u1ed1ng")
    @Min(value = 1, message = "S\u1ed1 kh\u00e1ch t\u1ed1i \u0111a ph\u1ea3i l\u1edbn h\u01a1n ho\u1eb7c b\u1eb1ng 1")
    private Integer maxPeople;

    @Min(value = 0, message = "S\u1ed1 kh\u00e1ch \u0111\u00e3 x\u00e1c nh\u1eadn kh\u00f4ng \u0111\u01b0\u1ee3c \u00e2m")
    private Integer currentPeople;

    @Min(value = 0, message = "S\u1ed1 ch\u1ed7 \u0111ang gi\u1eef kh\u00f4ng \u0111\u01b0\u1ee3c \u00e2m")
    private Integer reservedPeople;

    @DecimalMin(value = "0.0", inclusive = true, message = "Gi\u00e1 ng\u01b0\u1eddi l\u1edbn kh\u00f4ng \u0111\u01b0\u1ee3c \u00e2m")
    private BigDecimal adultPrice;

    @DecimalMin(value = "0.0", inclusive = true, message = "Gi\u00e1 tr\u1ebb em kh\u00f4ng \u0111\u01b0\u1ee3c \u00e2m")
    private BigDecimal childPrice;

    private Boolean isPrivateDeparture;

    private DepartureStatus status;
}
