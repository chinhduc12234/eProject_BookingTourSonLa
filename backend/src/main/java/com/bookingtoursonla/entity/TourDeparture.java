package com.bookingtoursonla.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.bookingtoursonla.entity.enums.DepartureStatus;

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
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tour_departures", uniqueConstraints = @UniqueConstraint(columnNames = { "tour_id", "departure_date" }))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourDeparture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tour_id", nullable = false)
    private Tour tour;

    @Column(name = "departure_date", nullable = false)
    private LocalDate departureDate;

    @Column(name = "max_people", nullable = false)
    private Integer maxPeople;

    @Column(name = "current_people", nullable = false)
    private Integer currentPeople;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DepartureStatus status;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();

        if (this.currentPeople == null)
            this.currentPeople = 0;
        if (this.status == null) {
            this.status = (this.currentPeople >= this.maxPeople)
                    ? DepartureStatus.FULL
                    : DepartureStatus.OPEN;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();

        this.status = (this.currentPeople >= this.maxPeople)
                ? DepartureStatus.FULL
                : DepartureStatus.OPEN;
    }
}