package com.bookingtoursonla.dto;

import java.util.List;

import lombok.Data;

@Data
public class AddTourImagesRequest {
    private List<String> imageUrls;
    private Long thumbnailImageId;
}