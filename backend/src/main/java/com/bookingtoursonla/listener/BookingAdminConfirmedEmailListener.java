package com.bookingtoursonla.listener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.bookingtoursonla.event.BookingAdminConfirmedEvent;
import com.bookingtoursonla.service.AdminBookingConfirmationEmailService;

@Component
public class BookingAdminConfirmedEmailListener {

    private static final Logger log = LoggerFactory.getLogger(BookingAdminConfirmedEmailListener.class);

    private final AdminBookingConfirmationEmailService emailService;

    public BookingAdminConfirmedEmailListener(AdminBookingConfirmationEmailService emailService) {
        this.emailService = emailService;
    }

    @Async("emailTaskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleBookingAdminConfirmed(BookingAdminConfirmedEvent event) {

        try {
            emailService.sendAdminConfirmation(event.bookingId());
        } catch (Exception ex) {
            log.error(
                    "Không thể gửi email admin xác nhận cho booking id {}",
                    event.bookingId(),
                    ex);
        }
    }
}
