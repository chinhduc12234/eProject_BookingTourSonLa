package com.bookingtoursonla.listener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.bookingtoursonla.event.BookingCreatedEvent;
import com.bookingtoursonla.service.BookingConfirmationEmailService;

@Component
public class BookingCreatedEmailListener {

    private static final Logger log = LoggerFactory.getLogger(BookingCreatedEmailListener.class);

    private final BookingConfirmationEmailService emailService;

    public BookingCreatedEmailListener(BookingConfirmationEmailService emailService) {
        this.emailService = emailService;
    }

    @Async("emailTaskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleBookingCreated(BookingCreatedEvent event) {

        try {
            emailService.sendBookingConfirmation(event.bookingId());
        } catch (Exception ex) {
            log.error(
                    "Không thể gửi email xác nhận cho booking id {}: {}",
                    event.bookingId(),
                    ex.getMessage());
        }
    }
}
