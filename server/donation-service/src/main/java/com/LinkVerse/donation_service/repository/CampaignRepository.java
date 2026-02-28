package com.LinkVerse.donation_service.repository;

import com.LinkVerse.donation_service.entity.Campaign;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CampaignRepository extends JpaRepository<Campaign, String> {
    List<Campaign> findAllByStatusAndStartDateBetween(
            Campaign.CampaignStatus status,
            Instant startDate,
            Instant endDate
    );

    @Query("SELECT COUNT(d) FROM Donation d WHERE d.campaign.id = :campaignId")
    long countDonationsByCampaignId(@Param("campaignId") String campaignId);

}
