package com.LinkVerse.donation_service.controller;

import com.LinkVerse.donation_service.service.AdTelegramAiHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/telegram/ads")
@RequiredArgsConstructor
public class AdTelegramWebhookController {

    private final AdTelegramAiHandler adTelegramAiHandler;

    @PostMapping("/webhook")
    public void onUpdate(@RequestBody Map<String, Object> update) {
        adTelegramAiHandler.handleUpdate(update);
    }
}
