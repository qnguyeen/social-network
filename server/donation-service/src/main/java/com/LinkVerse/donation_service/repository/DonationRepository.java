package com.LinkVerse.donation_service.repository;

import com.LinkVerse.donation_service.entity.Donation;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface DonationRepository extends JpaRepository<Donation, String> {
    List<Donation> findByCampaignId(String campaignId);
        @Query("SELECT d FROM Donation d WHERE d.paymentTime >= :start")
        List<Donation> findByPaymentTimeAfter(@Param("start") LocalDateTime start);

    @Query("SELECT SUM(d.amount) FROM Donation d WHERE d.status = 'SUCCESS'")
    Long sumAllAmount();

    @Query("SELECT SUM(d.amount) FROM Donation d WHERE d.campaign.id = :campaignId")
    Long sumAmountByCampaignId(@Param("campaignId") String campaignId);

    Long countByCampaignId(String campaignId);

    @Query("SELECT d.campaign.id, d.campaign.title, SUM(d.amount), COUNT(d.id) "
            + "FROM Donation d GROUP BY d.campaign.id, d.campaign.title ORDER BY SUM(d.amount) DESC")
    List<Object[]> findTopCampaigns();

    @Query("SELECT COUNT(d) FROM Donation d WHERE d.paymentTime >= :start")
    long countThisWeek(@Param("start") LocalDateTime start);

    @Query("SELECT SUM(d.amount) FROM Donation d WHERE d.paymentTime >= :start")
    Long sumThisWeek(@Param("start") LocalDateTime start);

    @Query(
            """
                    SELECT d.campaign.id, d.campaign.title, SUM(d.amount)
                    FROM Donation d
                    WHERE d.paymentTime >= :start
                    GROUP BY d.campaign.id, d.campaign.title
                    ORDER BY SUM(d.amount) DESC
                    """)
    List<Object[]> topCampaignsThisWeek(@Param("start") LocalDateTime start);
    @Query("SELECT COUNT(d) FROM Donation d WHERE d.paymentTime >= :start")
    long countThisMonth(@Param("start") LocalDateTime start);

    @Query("SELECT SUM(d.amount) FROM Donation d WHERE d.paymentTime >= :start")
    Long sumThisMonth(@Param("start") LocalDateTime start);

    @Query("SELECT COUNT(d) FROM Donation d WHERE d.paymentTime >= :start")
    long countThisYear(@Param("start") LocalDateTime start);

    @Query("SELECT SUM(d.amount) FROM Donation d WHERE d.paymentTime >= :start")
    Long sumThisYear(@Param("start") LocalDateTime start);
    @Query("SELECT SUM(d.amount) FROM Donation d WHERE d.donorId = :userId AND d.status = 'SUCCESS'")
Long sumByDonorId(@Param("userId") String userId);

@Query("SELECT COUNT(d) FROM Donation d WHERE d.donorId = :userId AND d.status = 'SUCCESS'")
long countByDonorId(@Param("userId") String userId);
@Query("SELECT SUM(d.amount) FROM Donation d WHERE d.donorId = :userId AND d.campaign.id = :campaignId AND d.status = 'SUCCESS'")
Long sumByUserIdAndCampaignId(@Param("userId") String userId, @Param("campaignId") String campaignId);

@Query("SELECT COUNT(d) FROM Donation d WHERE d.donorId = :userId AND d.campaign.id = :campaignId AND d.status = 'SUCCESS'")
long countByUserIdAndCampaignId(@Param("userId") String userId, @Param("campaignId") String campaignId);


}
