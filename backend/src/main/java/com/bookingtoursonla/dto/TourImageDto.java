package com.bookingtoursonla.dto;

import lombok.Data;

@Data
public class TourImageDto {

    private Long id;

    private String imageUrl;

    private Boolean isThumbnail;

    private Integer sortOrder;
}