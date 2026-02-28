package com.LinkVerse.donation_service.mapper;

import com.LinkVerse.donation_service.dto.response.AdCampaignResponse;
import com.LinkVerse.donation_service.entity.AdCampaign;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AdCampaignMapper {
    @Mapping(source = "mainAdCampaign.title", target = "mainAdCampaignTitle")
    @Mapping(target = "status", source = "status")
    @Mapping(source = "startDate", target = "startDate")
    @Mapping(target = "mainAdCampaignId", source = "mainAdCampaign.id")
    @Mapping(target = "donationAmount", expression = "java(adCampaign.getDonation() != null ? adCampaign.getDonation().getAmount() : null)")
    AdCampaignResponse toAdCampaignResponse(AdCampaign adCampaign);
}