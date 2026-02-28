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
public class TelegramWebhookInitializer {

    @Value("${telegram.bot.token}")
    private String botToken;

    @Value("${telegram.bot.webhook-url}")
    private String webhookUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostConstruct
    public void setWebhookOnStartup() {
        String apiUrl = "https://api.telegram.org/bot" + botToken + "/setWebhook?url=" + webhookUrl;
        try {
            String response = restTemplate.getForObject(apiUrl, String.class);
            log.info("✅ Đã set webhook Telegram thành công: {}", response);
        } catch (Exception e) {
            log.error("❌ Lỗi khi set webhook Telegram", e);
        }
    }
}
