package com.LinkVerse.post.repository.client;


import com.LinkVerse.post.configuration.AuthenticationRequestInterceptor;

import org.springframework.cloud.openfeign.FeignClient;


@FeignClient(
        name = "donation-service",
        url = "${donation.url}",
        configuration = {AuthenticationRequestInterceptor.class})
public interface PostClient {

}
