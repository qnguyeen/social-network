package com.LinkVerse.donation_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DonationNotification {
    private String receiverId; // User nhận (campaign owner)
    private String message;
    private LocalDateTime time;
}
