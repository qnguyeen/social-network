package com.LinkVerse.donation_service.mapper;

import com.LinkVerse.donation_service.dto.response.AdDonationResponse;
import com.LinkVerse.donation_service.entity.AdDonation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AdDonationMapper {
    @Mapping(target = "adCampaignId", source = "adCampaign.id")
    @Mapping(target = "payment", ignore = true)
    AdDonationResponse toAdDonationResponse(AdDonation adDonation);
}