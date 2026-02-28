package com.LinkVerse.statistics.controller;

import com.LinkVerse.statistics.dto.DonationStatisticDTO;
import com.LinkVerse.statistics.service.DonationStatisticService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/donations")
@RequiredArgsConstructor
public class DonationStaticController {

    private final DonationStatisticService donationStatisticService;

    @GetMapping("/all")
    public ResponseEntity<Map<String, Map<String, Long>>> getAllDonationStatistics() {
        Map<String, Map<String, Long>> statistics = donationStatisticService.getAllDonationStatistics();
        return ResponseEntity.ok(statistics);
    }
}
