package com.LinkVerse.donation_service.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class MainAdCampaignResponse {
    private String id;
    private String title;
    private long targetAmount;
    private String adminId;
        private List<Integer> durations;

}