package com.LinkVerse.donation_service.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "ad_donations")
public class AdDonation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
String adminId;
    String donorId;
    long amount;
    LocalDateTime paymentTime;
    String message;
    String imageUrls;
    String transactionId;

    @OneToOne
    @JoinColumn(name = "ad_campaign_id", nullable = false)
    @JsonBackReference
    AdCampaign adCampaign;

    @Enumerated(EnumType.STRING)
    AdDonationStatus status;

    public enum AdDonationStatus {
        SUCCESS,
        FAILED,
        PAYMENT_PROCESSING
    }
}