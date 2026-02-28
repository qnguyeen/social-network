package com.LinkVerse.donation_service.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class AdCampaignRequest {
    private String description;
    private String postId;
    private String mainAdCampaignId; // ID chiến dịch chính
    private List<String> timeSlots;
    private Integer duration;
}