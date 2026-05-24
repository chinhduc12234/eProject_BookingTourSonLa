package com.bookingtoursonla.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateBookingRequest {

    @NotNull(message = "Vui lòng chọn lịch khởi hành")
    private Long departureId;

    private String bookingType;

    private String organizationName;

    private String contactPerson;

    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String phone;

    private String pickupAddress;

    @Min(value = 0, message = "Số người lớn không hợp lệ")
    private Integer adultCount = 0;

    @Min(value = 0, message = "Số trẻ em không hợp lệ")
    private Integer childCount = 0;

    private String note;

    private String specialRequest;

    @Valid
    private List<BookingCustomerRequest> customers;
}
