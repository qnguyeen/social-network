package com.LinkVerse.statistics.repository.httpclient;

import com.LinkVerse.statistics.configuration.AuthenticationRequestInterceptor;
import com.LinkVerse.statistics.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.Instant;
import java.util.Map;

@FeignClient(name = "post-service", url = "${post-service.url}/post", configuration = {AuthenticationRequestInterceptor.class})
public interface PostClient {

    @GetMapping("/statistics/all")
    ApiResponse<Map<String, Map<String, Long>>> getPostStatistics();
}


