package com.LinkVerse.donation_service.repository.client;


import com.LinkVerse.donation_service.configuration.AuthenticationRequestInterceptor;
import com.LinkVerse.post.dto.ApiResponse;
import com.LinkVerse.post.dto.response.PostResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.util.List;

@FeignClient(
        name = "post-service",
        url = "${post.url}",
        configuration = {AuthenticationRequestInterceptor.class})
public interface PostClient {
    @GetMapping("/{postId}")
    ApiResponse<PostResponse> getPostById(@PathVariable("postId") String postId);
    @PutMapping("/{postId}/activate-ad")
    void activateAd(@PathVariable("postId") String postId);

}
