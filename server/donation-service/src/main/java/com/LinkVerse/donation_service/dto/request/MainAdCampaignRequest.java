package com.LinkVerse.donation_service.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class MainAdCampaignRequest {
    @JsonProperty("title")
    private String title;

    @JsonProperty("targetAmount")
    private long targetAmount;
    private List<Integer> durations;
}