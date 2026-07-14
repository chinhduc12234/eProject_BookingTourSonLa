package com.bookingtoursonla.controller;

import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookingtoursonla.dto.AssignGroupTourStaffRequest;
import com.bookingtoursonla.dto.GroupTourDepartureResponse;
import com.bookingtoursonla.service.BookingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/group-tours")
public class AdminGroupTourController {

    private final BookingService bookingService;

    public AdminGroupTourController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public Page<GroupTourDepartureResponse> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String keyword) {

        return bookingService.getAdminGroupTours(page, size, keyword);
    }

    @PutMapping("/{departureId}/staff")
    public GroupTourDepartureResponse assignStaff(
            @PathVariable Long departureId,
            @Valid @RequestBody AssignGroupTourStaffRequest request) {

        return bookingService.assignGroupTourStaff(
                departureId,
                request.getEmployeeId());
    }

    @PostMapping("/{departureId}/confirm")
    public GroupTourDepartureResponse confirm(
            @PathVariable Long departureId,
            Authentication authentication) {

        return bookingService.confirmGroupTour(
                departureId,
                authentication != null ? authentication.getName() : null);
    }
}
