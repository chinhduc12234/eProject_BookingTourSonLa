package com.bookingtoursonla.dto;

import java.time.LocalTime;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TourActivityRequest {

    private String title;

    private String description;

    private LocalTime startTime;

    private LocalTime endTime;

    private Long locationId;

    @Size(max = 255, message = "Địa điểm hoạt động không được vượt quá 255 ký tự")
    private String locationName;

    private Integer sortOrder;
}
