package com.LinkVerse.donation_service.service;

import com.LinkVerse.donation_service.dto.request.GeminiRequest;
import com.LinkVerse.donation_service.entity.Donation;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class TelegramCommandHandler {

    private final TelegramServiceAdmin telegramServiceAdmin;
    private final DonationService donationService;
    private final GeminiAiTeleService geminiAiTeleService;
    private final ObjectMapper objectMapper = new ObjectMapper();


    public void handleUpdate(Map<String, Object> update) {
    Map<String, Object> message = (Map<String, Object>) update.get("message");
    if (message == null) return;

    String chatId = String.valueOf(((Map<String, Object>) message.get("chat")).get("id"));
    String text = (String) message.get("text");
    if (text == null || text.isBlank()) {
        telegramServiceAdmin.sendTo(chatId, "Vui lòng gửi một tin nhắn để tôi có thể hỗ trợ bạn! 📝");
        return;
    }

    try {
        if (text.equalsIgnoreCase("/start")) {
            telegramServiceAdmin.sendTo(chatId, """
                    👋 *Xin chào!* Tôi là bot hỗ trợ của LinkVerse.
                    📜 *Danh sách lệnh:*
                    /stats - Tổng giao dịch 💰
                    /donation [mã] - Chi tiết giao dịch 🧾
                    /campaign [mã] - Thống kê chiến dịch 📊
                    /analyze [mã] - Phân tích tiến độ 📈
                    /help - Trợ giúp ℹ️
                    """);
            return;
        }

        if (text.equalsIgnoreCase("/help")) {
            telegramServiceAdmin.sendTo(chatId, """
                    📜 *Lệnh có sẵn:*
                    /stats
                    /donation [mã]
                    /campaign [mã]
                    /analyze [mã]
                    Bạn cũng có thể hỏi: "Thống kê tuần này", "Chiến dịch abc123 thế nào?" v.v.
                    """);
            return;
        }

        if (text.equalsIgnoreCase("/stats")) {
            String result = donationService.getStatistics();
            telegramServiceAdmin.sendTo(chatId, "📊 *Thống kê tổng quan:*\n" + result);
            return;
        }

        if (text.startsWith("/donation")) {
            String[] parts = text.trim().split("\\s+");
            if (parts.length < 2) {
                telegramServiceAdmin.sendTo(chatId, "⚠️ Vui lòng nhập mã giao dịch. Ví dụ: /donation abc123");
                return;
            }
            String donationId = extractId(parts[1]);
            String result = donationService.getDonationInfo(donationId);
            telegramServiceAdmin.sendTo(chatId, result);
            return;
        }

        if (text.startsWith("/campaign")) {
            String[] parts = text.trim().split("\\s+");
            if (parts.length < 2) {
                telegramServiceAdmin.sendTo(chatId, "⚠️ Vui lòng nhập mã chiến dịch. Ví dụ: /campaign abc123");
                return;
            }
            String campaignId = extractId(parts[1]);
            String stat = donationService.getCampaignStatistics(campaignId);
            telegramServiceAdmin.sendTo(chatId, stat);
            File file = donationService.exportDonationsByCampaign(campaignId);
            telegramServiceAdmin.sendDocument(chatId, file, "📄 *Danh sách giao dịch của chiến dịch này:*");
            file.delete();
            return;
        }

        if (text.startsWith("/analyze")) {
            String[] parts = text.trim().split("\\s+");
            if (parts.length < 2) {
                telegramServiceAdmin.sendTo(chatId, "⚠️ Vui lòng nhập mã chiến dịch. Ví dụ: /analyze abc123");
                return;
            }
            String campaignId = extractId(parts[1]);
            String result = donationService.analyzeCampaignProgress(campaignId);
            telegramServiceAdmin.sendTo(chatId, result);
            return;
        }

        // ✅ Câu hỏi tự do -> AI xử lý toàn bộ
        geminiAiTeleService.processUserQuestion(new GeminiRequest(text, null), chatId);

    } catch (Exception e) {
        log.error("❌ Lỗi xử lý update Telegram", e);
        telegramServiceAdmin.sendTo(chatId, "⚠️ Có lỗi xảy ra. Vui lòng thử lại sau. 😔");
    }
}



    private void fallbackToFreeStyleAI(String chatId, String userInput) {
        try {
            GeminiRequest request = new GeminiRequest(userInput, null);
            String reply = geminiAiTeleService.askGemini(request);
            telegramServiceAdmin.sendTo(chatId, reply);
        } catch (Exception e) {
            log.error("❌ Lỗi fallback AI", e);
            telegramServiceAdmin.sendTo(chatId, "⚠️ AI không thể trả lời lúc này. Vui lòng thử lại sau. 😔");
        }
    }


    private String extractId(String text) {
        Pattern pattern = Pattern.compile("([a-f0-9\\-]{36})");
        Matcher matcher = pattern.matcher(text);
        return matcher.find() ? matcher.group(1) : text;
    }
}