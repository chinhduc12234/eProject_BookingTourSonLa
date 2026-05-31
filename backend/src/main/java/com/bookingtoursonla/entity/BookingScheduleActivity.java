package com.bookingtoursonla.entity;

import java.time.LocalDateTime;
import java.time.LocalTime;

import com.bookingtoursonla.entity.enums.BookingScheduleActivityStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "booking_schedule_activities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingScheduleActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_schedule_day_id", nullable = false)
    private BookingScheduleDay bookingScheduleDay;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_activity_id")
    private TourActivity originalActivity;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "actual_start_time")
    private LocalDateTime actualStartTime;

    @Column(name = "actual_end_time")
    private LocalDateTime actualEndTime;

    @Column(name = "actual_location", columnDefinition = "TEXT")
    private String actualLocation;

    @Column(name = "attachment_url", length = 1000)
    private String attachmentUrl;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "activity_status", nullable = false)
    private BookingScheduleActivityStatus status = BookingScheduleActivityStatus.PENDING;

    @Column(name = "actual_note", columnDefinition = "TEXT")
    private String actualNote;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by_employee")
    private User updatedByEmployee;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (this.status == null) {
            this.status = BookingScheduleActivityStatus.PENDING;
        }
        if (this.createdAt == null) {
            this.createdAt = now;
        }
        if (this.updatedAt == null) {
            this.updatedAt = now;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
