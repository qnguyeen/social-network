package com.LinkVerse.statistics.controller;

import com.LinkVerse.statistics.dto.ApiResponse;
import com.LinkVerse.statistics.repository.httpclient.PostClient;
import com.LinkVerse.statistics.service.DonationStatisticService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostStaticController {
    private final PostClient postClient;

    @GetMapping("/all")
    public ResponseEntity<Map<String, Map<String, Long>>> getPostStatistics() {
        ApiResponse<Map<String, Map<String, Long>>> response = postClient.getPostStatistics();
        if (response.getCode() == 200 && response.getResult() != null) {
            return ResponseEntity.ok(response.getResult());
        } else {
            return ResponseEntity.status(response.getCode())
                    .body(Collections.emptyMap());
        }
    }

}
