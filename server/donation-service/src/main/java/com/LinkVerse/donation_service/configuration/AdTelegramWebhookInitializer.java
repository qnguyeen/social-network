package com.LinkVerse.donation_service.configuration;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdTelegramWebhookInitializer {

    @Value("${telegram.ads-bot.token}")
    private String adsBotToken;

    @Value("${telegram.ads-bot.webhook-url}")
    private String adsBotWebhookUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostConstruct
    public void setAdBotWebhookOnStartup() {
        String apiUrl = "https://api.telegram.org/bot" + adsBotToken + "/setWebhook?url=" + adsBotWebhookUrl;
        try {
            String response = restTemplate.getForObject(apiUrl, String.class);
            log.info("✅ Đã set webhook Telegram ADS bot thành công: {}", response);
        } catch (Exception e) {
            log.error("❌ Lỗi khi set webhook Telegram ADS bot", e);
        }
    }
}
