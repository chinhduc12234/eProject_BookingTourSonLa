package com.bookingtoursonla.dto;

import java.util.List;

import lombok.Data;

@Data
public class ReplaceTourImagesRequest {

    private List<TourImagePayload> images;
}