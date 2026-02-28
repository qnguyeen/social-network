package com.LinkVerse.donation_service.dto.response;

import com.LinkVerse.donation_service.entity.AdCampaign;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class AdCampaignResponse {
    private String id;
    private String title; // lấy từ mainAdCampaign
    private String mainAdCampaignTitle; // thêm mới nếu muốn rõ ràng
    private String description;
    private String postId;
    private String mainAdCampaignId;
    private List<String> timeSlots;
    private String userId;
    private AdCampaign.AdCampaignStatus status;
    private Long donationAmount;
    private Instant startDate;
}
