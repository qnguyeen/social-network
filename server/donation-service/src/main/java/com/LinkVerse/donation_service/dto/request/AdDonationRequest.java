package com.LinkVerse.donation_service.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;


@Data
public class AdDonationRequest {
    @NotNull(message = "Ad campaign ID must not be null")
    @JsonProperty("adCampaignId")
    private String adCampaignId;

    private long amount;
    private String ipAddress;
}