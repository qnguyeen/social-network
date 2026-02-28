package com.LinkVerse.donation_service.repository;


import com.LinkVerse.donation_service.entity.AdCampaign;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdCampaignRepository extends JpaRepository<AdCampaign, String> {
    List<AdCampaign> findAllByUserId(String userId);

}