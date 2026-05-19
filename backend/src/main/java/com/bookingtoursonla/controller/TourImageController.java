package com.bookingtoursonla.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookingtoursonla.dto.ReplaceTourImagesRequest;
import com.bookingtoursonla.dto.TourImageDto;
import com.bookingtoursonla.service.TourImageService;

@RestController
@RequestMapping("/api/admin/tours")
public class TourImageController {

    private final TourImageService service;

    public TourImageController(
            TourImageService service) {
        this.service = service;
    }

    @GetMapping("/{tourId}/images")
    public List<TourImageDto> getImages(
            @PathVariable Long tourId) {

        return service.getImages(tourId);
    }

    @PutMapping("/{tourId}/images")
    public List<TourImageDto> replaceImages(
            @PathVariable Long tourId,
            @RequestBody ReplaceTourImagesRequest request) {

        return service.replaceImages(
                tourId,
                request);
    }

    @DeleteMapping("/{tourId}/images/{imageId}")
    public void deleteImage(
            @PathVariable Long tourId,
            @PathVariable Long imageId) {

        service.deleteImage(
                tourId,
                imageId);
    }

    @PutMapping("/{tourId}/images/{imageId}/thumbnail")
    public TourImageDto setThumbnail(
            @PathVariable Long tourId,
            @PathVariable Long imageId) {

        return service.setThumbnail(
                tourId,
                imageId);
    }
}