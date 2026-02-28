package com.LinkVerse.donation_service.repository;

import com.LinkVerse.donation_service.entity.AdDonation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdDonationRepository extends JpaRepository<AdDonation, String> {
    List<AdDonation> findByAdCampaignId(String adCampaignId);
}