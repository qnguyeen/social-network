package com.LinkVerse.admin.repository.client;

import com.LinkVerse.admin.configuration.AuthenticationRequestInterceptor;
import com.LinkVerse.statistics.dto.*;
import com.LinkVerse.statistics.entity.CampaignStatics;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@FeignClient(
    name = "statistics",
    url = "http://localhost:8085/statistics",
    configuration = {AuthenticationRequestInterceptor.class}
)
public interface StaticServiceClient {

    // 🟠 CAMPAIGN
    @GetMapping("/campaign/summary")
    ResponseEntity<Map<String, Map<String, Long>>> getCampaignStatistics();

    @GetMapping("/campaign/completion-duration")
    ResponseEntity<Map<String, Double>> getAverageCampaignCompletionDuration();

    @GetMapping("/campaign/top-amount-campaigns")
    ResponseEntity<List<CampaignStatics>> getTop10ByTargetAmount();

    // 🔵 DONATION
    @GetMapping("/donations/all")
    ResponseEntity<Map<String, Map<String, Long>>> getAllDonationStatistics();

    // 🟣 GROUP
    @GetMapping("/groups/all")
    ResponseEntity<GroupStatisticDTO> getGroupStatistics();

    @GetMapping("/groups/top10")
    ResponseEntity<List<GroupResponse>> getTop10Groups();

    // 🟡 POST
    @GetMapping("/posts/all")
    ResponseEntity<Map<String, Map<String, Long>>> getPostStatistics();

    // 🟢 USER
    @GetMapping("/users/all")
    ResponseEntity<UserStatisticDTO> getUserStatistics();

    @GetMapping("/users/chart")
    ResponseEntity<Map<LocalDate, Long>> getRegistrationChart(
        @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
        @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    );
}
