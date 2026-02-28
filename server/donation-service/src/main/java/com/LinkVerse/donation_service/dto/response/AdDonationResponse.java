package com.LinkVerse.donation_service.dto.response;

import com.LinkVerse.donation_service.entity.AdDonation;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AdDonationResponse {
    private String id;

    private String donorId;
    private String adminId;
    private long amount;
    private LocalDateTime paymentTime;
    private String adCampaignId;
    private AdDonation.AdDonationStatus status;
    private InitPaymentResponse payment;
}