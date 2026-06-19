package com.bookingtoursonla.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateBookingScheduleActivityRequest {

    @Size(max = 30, message = "Tr\u1ea1ng th\u00e1i ho\u1ea1t \u0111\u1ed9ng kh\u00f4ng \u0111\u01b0\u1ee3c v\u01b0\u1ee3t qu\u00e1 30 k\u00fd t\u1ef1")
    private String status;

    private LocalDateTime actualStartTime;

    private LocalDateTime actualEndTime;

    @Size(max = 255, message = "\u0110\u1ecba \u0111i\u1ec3m th\u1ef1c t\u1ebf kh\u00f4ng \u0111\u01b0\u1ee3c v\u01b0\u1ee3t qu\u00e1 255 k\u00fd t\u1ef1")
    private String actualLocation;

    @Size(max = 1000, message = "Ghi ch\u00fa th\u1ef1c t\u1ebf kh\u00f4ng \u0111\u01b0\u1ee3c v\u01b0\u1ee3t qu\u00e1 1000 k\u00fd t\u1ef1")
    private String actualNote;

    @Size(max = 500, message = "\u0110\u01b0\u1eddng d\u1eabn t\u1ec7p \u0111\u00ednh k\u00e8m kh\u00f4ng \u0111\u01b0\u1ee3c v\u01b0\u1ee3t qu\u00e1 500 k\u00fd t\u1ef1")
    private String attachmentUrl;
}
