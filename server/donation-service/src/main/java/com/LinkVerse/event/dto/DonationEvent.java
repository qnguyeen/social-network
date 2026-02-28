package com.LinkVerse.event.dto;

import com.LinkVerse.donation_service.entity.Campaign;
import com.LinkVerse.donation_service.entity.Donation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonationEvent {
    private String donationId;
    private long amount;
    private Donation.DonationStatus status;
    private LocalDateTime paymentTime;

}
