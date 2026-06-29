package com.bookingtoursonla.event;

public record BookingEmployeeCompletedEvent(
        Long bookingId,
        String employeeName) {
}
