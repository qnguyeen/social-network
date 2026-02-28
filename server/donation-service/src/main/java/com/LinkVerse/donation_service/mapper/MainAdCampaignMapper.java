package com.LinkVerse.donation_service.mapper;

import com.LinkVerse.donation_service.dto.request.MainAdCampaignRequest;
import com.LinkVerse.donation_service.dto.response.MainAdCampaignResponse;
import com.LinkVerse.donation_service.entity.MainAdCampaign;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MainAdCampaignMapper {
    @Mapping(source = "targetAmount", target = "targetAmount")
    MainAdCampaignResponse toMainAdCampaignResponse(MainAdCampaign mainAdCampaign);
     @Mapping(target = "id", ignore = true)
    @Mapping(target = "adminId", ignore = true)
    MainAdCampaign toMainAdCampaign(MainAdCampaignRequest request);
}