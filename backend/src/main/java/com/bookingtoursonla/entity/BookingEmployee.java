package com.bookingtoursonla.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "booking_employees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingEmployee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private User employee;

    @Column(name = "role_in_trip", length = 30)
    private String roleInTrip = "GUIDE";

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "assignment_status", length = 30)
    private String assignmentStatus = "ASSIGNED";

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @PrePersist
    public void prePersist() {
        if (this.roleInTrip == null || this.roleInTrip.isBlank()) {
            this.roleInTrip = "GUIDE";
        }
        if (this.assignmentStatus == null || this.assignmentStatus.isBlank()) {
            this.assignmentStatus = "ASSIGNED";
        }
        if (this.assignedAt == null) {
            this.assignedAt = LocalDateTime.now();
        }
    }
}
