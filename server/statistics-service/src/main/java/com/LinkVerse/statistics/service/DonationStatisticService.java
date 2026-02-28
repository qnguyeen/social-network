package com.LinkVerse.statistics.service;

import com.LinkVerse.statistics.dto.DonationStatisticDTO;
import com.LinkVerse.statistics.entity.DonationStatics;
import com.LinkVerse.statistics.repository.DonationStatisticRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DonationStatisticService {

    private final DonationStatisticRepository donationStatisticRepository;

    public Map<String, Map<String, Long>> getAllDonationStatistics() {
        LocalDate now = LocalDate.now();

        // Define time ranges
        LocalDate today = now;
        LocalDate startOfWeek = now.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate startOfYear = now.withDayOfYear(1);

        // Create result map
        Map<String, Map<String, Long>> result = new HashMap<>();

        // Get statistics for each time period
        result.put("today", getDonationStatisticsByDateRange(today, today));
        result.put("thisweek", getDonationStatisticsByDateRange(startOfWeek, now));
        result.put("thismonth", getDonationStatisticsByDateRange(startOfMonth, now));
        result.put("thisyear", getDonationStatisticsByDateRange(startOfYear, now));
        result.put("all", getAllStatistics());

        return result;
    }

    private Map<String, Long> getDonationStatisticsByDateRange(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.plusDays(1).atStartOfDay();

        List<DonationStatics> donations = donationStatisticRepository.findAllByPaymentTimeBetween(start, end);

        long donationCount = donations.size();
        long totalAmount = donations.stream().mapToLong(DonationStatics::getAmount).sum();

        Map<String, Long> result = new HashMap<>();
        result.put("donationCount", donationCount);
        result.put("totalAmount", totalAmount);
        return result;
    }

    private Map<String, Long> getAllStatistics() {
        List<DonationStatics> donations = donationStatisticRepository.findAll();

        long donationCount = donations.size();
        long totalAmount = donations.stream().mapToLong(DonationStatics::getAmount).sum();

        Map<String, Long> result = new HashMap<>();
        result.put("donationCount", donationCount);
        result.put("totalAmount", totalAmount);
        return result;
    }
}