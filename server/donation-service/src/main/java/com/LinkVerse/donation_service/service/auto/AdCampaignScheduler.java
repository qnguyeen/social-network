package com.LinkVerse.donation_service.service.auto;

import com.LinkVerse.donation_service.entity.AdCampaign;
import com.LinkVerse.donation_service.repository.AdCampaignRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdCampaignScheduler {
    private final AdCampaignRepository adCampaignRepository;

    @Scheduled(cron = "0 0 0 * * *") // chạy hàng ngày lúc 00:00
    @Transactional
    public void finishExpiredCampaigns() {
        Instant now = Instant.now();
        List<AdCampaign> expiredCampaigns = adCampaignRepository.findAll().stream()
            .filter(c -> c.getStatus() == AdCampaign.AdCampaignStatus.ACTIVE)
            .filter(c -> c.getEndDate() != null && c.getEndDate().isBefore(now))
            .collect(Collectors.toList());

        expiredCampaigns.forEach(campaign -> {
            campaign.setStatus(AdCampaign.AdCampaignStatus.FINISHED);
            adCampaignRepository.save(campaign);
            log.info("✅ Chiến dịch quảng cáo '{}' đã tự động kết thúc vào {}",
                     campaign.getTitle(), campaign.getEndDate());
        });
    }
}
