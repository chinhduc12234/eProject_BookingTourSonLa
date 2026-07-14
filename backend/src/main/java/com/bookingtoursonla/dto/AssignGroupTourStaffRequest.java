package com.bookingtoursonla.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignGroupTourStaffRequest {

    @NotNull(message = "Vui lòng chọn nhân viên phụ trách")
    private Long employeeId;
}
