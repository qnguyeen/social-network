package com.LinkVerse.event.dto;

import com.LinkVerse.donation_service.entity.AdDonation;
import lombok.*;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdDonationEvent implements Serializable {
    private String adDonationId;
    private long amount;
    private AdDonation.AdDonationStatus status;
}