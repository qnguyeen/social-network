package com.LinkVerse.statistics.service;

import com.LinkVerse.statistics.entity.CampaignStatics;
import com.LinkVerse.statistics.repository.CampaignStatisticRepository;
import com.LinkVerse.statistics.repository.httpclient.CampaignClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CampaignStatisticService {

    private final CampaignStatisticRepository campaignStatisticRepository;
    private final CampaignClient campaignClient;

    public Map<String, Map<String, Long>> getStatisticsByDateRange() {
        LocalDate now = LocalDate.now();

        LocalDate today = now;
        LocalDate startOfWeek = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate startOfYear = now.withDayOfYear(1);

        Map<String, Map<String, Long>> result = new HashMap<>();

        result.put("today", getCampaignStatisticsByDateRange(today, today));
        result.put("thisweek", getCampaignStatisticsByDateRange(startOfWeek, now));
        result.put("thismonth", getCampaignStatisticsByDateRange(startOfMonth, now));
        result.put("thisyear", getCampaignStatisticsByDateRange(startOfYear, now));
        result.put("all", getAllCampaignStatistics());

        log.info("Returning campaign statistics: {}", result);
        return result;
    }

    private Map<String, Long> getCampaignStatisticsByDateRange(LocalDate startDate, LocalDate endDate) {
        Instant start = startDate.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant end = endDate.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        log.info("Querying campaigns between {} and {}", start, end);
        List<CampaignStatics> campaigns = campaignStatisticRepository.findByStartDateBetween(start, end);
        log.info("Found {} campaigns for range", campaigns.size());

        long totalCampaigns = campaigns.size();
        long totalTargetAmount = campaigns.stream().mapToLong(CampaignStatics::getTargetAmount).sum();

        Map<String, Long> result = new HashMap<>();
        result.put("totalCampaigns", totalCampaigns);
        result.put("totalTargetAmount", totalTargetAmount);
        return result;
    }

    private Map<String, Long> getAllCampaignStatistics() {
        log.info("Querying all campaigns");
        List<CampaignStatics> campaigns = campaignStatisticRepository.findAll();
        log.info("Found {} campaigns for all time", campaigns.size());

        long totalCampaigns = campaigns.size();
        long totalTargetAmount = campaigns.stream().mapToLong(CampaignStatics::getTargetAmount).sum();

        Map<String, Long> result = new HashMap<>();
        result.put("totalCampaigns", totalCampaigns);
        result.put("totalTargetAmount", totalTargetAmount);
        return result;
    }

    public Map<String, Double> getAverageCampaignCompletionDuration() {
        LocalDate now = LocalDate.now();

        LocalDate today = now;
        LocalDate startOfWeek = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate startOfYear = now.withDayOfYear(1);

        Map<String, Double> result = new HashMap<>();

        result.put("today", getAverageCompletionDurationForRange(today, today));
        result.put("thisweek", getAverageCompletionDurationForRange(startOfWeek, now));
        result.put("thismonth", getAverageCompletionDurationForRange(startOfMonth, now));
        result.put("thisyear", getAverageCompletionDurationForRange(startOfYear, now));
        result.put("all", getAverageCompletionDurationForAll());

        return result;
    }

    private double getAverageCompletionDurationForRange(LocalDate startDate, LocalDate endDate) {
        Instant start = startDate.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant end = endDate.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        try {
            double duration = campaignClient.getAverageCompletionTimeInDays(start, end);
            log.info("Fetched average completion time for range {} to {}: {}", start, end, duration);
            return duration;
        } catch (Exception e) {
            log.error("Error fetching average completion time for range {} to {}: {}", start, end, e.getMessage(), e);
            return 0.0;
        }
    }

    private double getAverageCompletionDurationForAll() {
        LocalDate startDate = LocalDate.of(2000, 1, 1);
        LocalDate endDate = LocalDate.now();
        Instant start = startDate.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant end = endDate.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        try {
            double duration = campaignClient.getAverageCompletionTimeInDays(start, end);
            log.info("Fetched average completion time for all campaigns: {}", duration);
            return duration;
        } catch (Exception e) {
            log.error("Error fetching average completion time for all campaigns: {}", e.getMessage(), e);
            return 0.0;
        }
    }

    public List<CampaignStatics> getTop10CampaignsByTargetAmount() {
        log.info("Querying top 10 campaigns by target amount");
        List<CampaignStatics> campaigns = campaignStatisticRepository.findAll()
                .stream()
                .sorted((c1, c2) -> Long.compare(c2.getTargetAmount(), c1.getTargetAmount()))
                .limit(10)
                .collect(Collectors.toList());
        log.info("Found {} top campaigns", campaigns.size());
        return campaigns;
    }
}