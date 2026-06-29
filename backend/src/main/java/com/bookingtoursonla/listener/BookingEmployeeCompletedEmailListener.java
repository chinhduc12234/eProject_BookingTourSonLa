package com.bookingtoursonla.listener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.bookingtoursonla.event.BookingEmployeeCompletedEvent;
import com.bookingtoursonla.service.TourCompletedThankYouEmailService;

@Component
public class BookingEmployeeCompletedEmailListener {

    private static final Logger log = LoggerFactory.getLogger(BookingEmployeeCompletedEmailListener.class);

    private final TourCompletedThankYouEmailService emailService;

    public BookingEmployeeCompletedEmailListener(TourCompletedThankYouEmailService emailService) {
        this.emailService = emailService;
    }

    @Async("emailTaskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleBookingEmployeeCompleted(BookingEmployeeCompletedEvent event) {

        try {
            emailService.sendTourCompletedThankYou(
                    event.bookingId(),
                    event.employeeName());
        } catch (Exception ex) {
            log.error(
                    "Không thể gửi email cảm ơn sau tour cho booking id {}",
                    event.bookingId(),
                    ex);
        }
    }
}
