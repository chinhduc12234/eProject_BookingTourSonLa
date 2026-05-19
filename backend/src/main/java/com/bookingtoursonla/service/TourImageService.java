package com.bookingtoursonla.service;

import java.util.List;

import com.bookingtoursonla.dto.ReplaceTourImagesRequest;
import com.bookingtoursonla.dto.TourImageDto;

public interface TourImageService {

    List<TourImageDto> getImages(Long tourId);

    List<TourImageDto> replaceImages(
            Long tourId,
            ReplaceTourImagesRequest request);

    void deleteImage(
            Long tourId,
            Long imageId);

    TourImageDto setThumbnail(
            Long tourId,
            Long imageId);
}