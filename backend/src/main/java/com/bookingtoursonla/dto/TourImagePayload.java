package com.bookingtoursonla.dto;

import lombok.Data;

@Data
public class TourImagePayload {

    private String imageUrl;

    private Boolean isThumbnail;

    private Integer sortOrder;
}