package com.LinkVerse.post.controller;

import com.LinkVerse.post.dto.ApiResponse;
import com.LinkVerse.post.service.PostsStatisticService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/statistics")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PostStatisticController {

    private final PostsStatisticService postStatisticService;

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<Map<String, Map<String, Long>>>> getAllPostStatistics() {
        Map<String, Map<String, Long>> statistics = postStatisticService.getAllPostStatistics();
        return ResponseEntity.ok(
                ApiResponse.<Map<String, Map<String, Long>>>builder()
                        .code(HttpStatus.OK.value())
                        .message("Post statistics retrieved successfully.")
                        .result(statistics)
                        .build()
        );
    }
}