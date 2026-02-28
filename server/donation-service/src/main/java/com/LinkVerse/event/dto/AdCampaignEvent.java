package com.LinkVerse.event.dto;

import com.LinkVerse.donation_service.entity.AdCampaign;
import lombok.*;

import java.io.Serializable;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdCampaignEvent implements Serializable {
    private String adCampaignId;
    private String postId;
    private long targetAmount;
    private Instant startDate;
    private Instant endDate;
    private AdCampaign.AdCampaignStatus status;
}