package com.LinkVerse.statistics.controller;

import com.LinkVerse.statistics.dto.CampaignStatisticDTO;
import com.LinkVerse.statistics.dto.DonationStatisticDTO;
import com.LinkVerse.statistics.entity.CampaignStatics;
import com.LinkVerse.statistics.service.CampaignStatisticService;
import com.LinkVerse.statistics.service.DonationStatisticService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/campaign")
@RequiredArgsConstructor
public class CampaitnStaticController {

    private final CampaignStatisticService campaignStatisticService;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Map<String, Long>>> getCampaignStatistics() {
        Map<String, Map<String, Long>> statistics = campaignStatisticService.getStatisticsByDateRange();
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/completion-duration")
    public ResponseEntity<Map<String, Double>> getAverageCampaignCompletionDuration() {
        Map<String, Double> durations = campaignStatisticService.getAverageCampaignCompletionDuration();
        return ResponseEntity.ok(durations);
    }

    @GetMapping("/top-amount-campaigns")
    public List<CampaignStatics> getTop10ByTargetAmount() {
        return campaignStatisticService.getTop10CampaignsByTargetAmount();
    }
}
