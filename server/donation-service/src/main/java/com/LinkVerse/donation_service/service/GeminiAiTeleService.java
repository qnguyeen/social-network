package com.LinkVerse.donation_service.service;

import com.LinkVerse.donation_service.dto.request.GeminiRequest;
import com.LinkVerse.donation_service.entity.Donation;
import com.LinkVerse.donation_service.repository.DonationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiAiTeleService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final CampaignService campaignService;
    private final DonationService donationService;
    private final TelegramServiceAdmin telegramServiceAdmin;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final DonationRepository donationRepository;

    private static final String NATURAL_PROMPT = """
        Bạn là trợ lý AI thông minh cho nền tảng quyên góp LinkVerse, hoạt động trên Telegram.

        🎯 Vai trò:
        - Hỗ trợ người dùng tìm kiếm thông tin về chiến dịch, giao dịch, thống kê, hoặc người dùng.
        - Hiểu và trả lời các câu hỏi dù người dùng hỏi ngắn gọn, mơ hồ hoặc không cung cấp đầy đủ chi tiết.
        - Trả lời theo định dạng phù hợp với Telegram (ngắn gọn, sử dụng emoji hoặc định dạng in đậm *nếu cần*).

        ✅ Cách trả lời:
        - Trả lời bằng tiếng Việt, tự nhiên, thân thiện, ngắn gọn và đúng trọng tâm.
        - Nếu câu hỏi có mã chiến dịch/giao dịch, trả lời dựa trên dữ liệu có sẵn từ hệ thống.
        - Nếu người dùng hỏi về số tiền giao dịch, chỉ trả lời số tiền (ví dụ: "10,000 VND 💰").
        - Nếu người dùng hỏi về trạng thái giao dịch, chỉ trả lời trạng thái (ví dụ: "Thành công ✅" hoặc "Đang xử lý ⏳").
        - Nếu người dùng hỏi về tổng số giao dịch trên hệ thống, chỉ trả lời số lượng giao dịch (ví dụ: "12,345 giao dịch 📦").
        - Nếu câu hỏi mơ hồ, cố gắng đoán ý định và đưa ra câu trả lời hợp lý nhất.
        - Nếu không tìm thấy thông tin, trả lời lịch sự: "Tôi không tìm thấy thông tin... 😔" hoặc "Vui lòng cung cấp thêm chi tiết 📝."
        - Nếu câu hỏi ngoài phạm vi, từ chối nhẹ nhàng: "Xin lỗi, tôi không thể hỗ trợ với câu hỏi này 😔."

        📌 Lưu ý:
        - Không bịa đặt thông tin.
        - Dựa trên dữ liệu hệ thống khi trả lời về thống kê, phân tích hoặc chi tiết cụ thể.
        - Ưu tiên trả lời ngắn gọn, dễ đọc trên Telegram.
    """;

    private static final String INTENT_PROMPT = """
        Bạn là trợ lý phân tích ý định của hệ thống LinkVerse.

        Dựa vào câu hỏi từ người dùng, xác định ý định và trả về JSON đúng định dạng:

        1. Nếu người dùng muốn thống kê một chiến dịch:
        {
            "intent": "campaign_statistics",
            "campaignId": "abc123"
        }

        2. Nếu người dùng muốn phân tích tiến độ chiến dịch:
        {
            "intent": "campaign_analyze",
            "campaignId": "abc123"
        }

        3. Nếu người dùng muốn xem chi tiết một giao dịch:
        {
            "intent": "donation_detail",
            "donationId": "abc123"
        }

        4. Nếu người dùng hỏi về trạng thái giao dịch:
        {
            "intent": "donation_status",
            "donationId": "abc123"
        }

        5. Nếu người dùng hỏi về số tiền của một giao dịch:
        {
            "intent": "donation_amount",
            "donationId": "abc123"
        }

        6. Nếu người dùng hỏi về tổng số giao dịch trên hệ thống:
        {
            "intent": "system_statistics"
        }

        7. Nếu không rõ ý định hoặc thiếu ID:
        {
            "intent": "unknown"
        }
        8. Nếu người dùng hỏi về thống kê trong tuần/tháng/năm:
                {
                    "intent": "donation_stats_time",
                    "period": "week" | "month" | "year"
                }
        9. Nếu người dùng hỏi về thống kê tất cả các chiến dịch:
                {
                    "intent": "campaign_stats_all"
                }
        10. Nếu người dùng hỏi người dùng [userId] đã quyên góp bao nhiêu:
                {
                    "intent": "donation_by_user",
                    "userId": "abc123"
                }
        11. Nếu người dùng hỏi người dùng [userId] đã quyên góp bao nhiêu trong chiến dịch [campaignId]:
                {
                    "intent": "donation_by_user_in_campaign",
                    "userId": "abc123",
                    "campaignId": "xyz789"
                }
        ❗ Lưu ý:
        - Tìm ID trong câu hỏi (có thể là UUID hoặc chuỗi bất kỳ).
        - Nếu không tìm thấy ID nhưng ý định rõ ràng, trả về intent với campaignId/donationId là rỗng.
        - Chỉ trả về JSON, không thêm nội dung khác.
    """;

private String getSuggestions(String intent, String campaignIdOrDonationId) {
    return switch (intent) {
        case "campaign_statistics", "campaign_analyze" -> String.format("""
💡 Bạn có thể hỏi tiếp:
- Phân tích tiến độ chiến dịch: `Phân tích tiến độ chiến dịch %s`
- Người dùng [userId] đã quyên góp bao nhiêu trong chiến dịch %s
""", campaignIdOrDonationId, campaignIdOrDonationId);

        case "donation_detail", "donation_status", "donation_amount" -> String.format("""
💡 Bạn có thể hỏi tiếp:
- Trạng thái giao dịch: `Giao dịch %s thành công chưa?`
- Số tiền đã quyên góp: `Giao dịch %s là bao nhiêu tiền?`
""", campaignIdOrDonationId, campaignIdOrDonationId);

        default -> "";
    };
}


    public void handleResponseWithSuggestions(String chatId, String intent, String campaignId, String message) {
        String suggestions = getSuggestions(intent, campaignId);
        telegramServiceAdmin.sendTo(chatId, message + (suggestions.isBlank() ? "" : "\n" + suggestions));
    }
        public String getCampaignQuestionSuggestions() {
        return campaignService.getAllCampaigns().stream()
                .limit(5)
                .map(campaign -> String.format("\uD83D\uDCCA *%s* (ID: `%s`):\n- `Thống kê chiến dịch %s`\n- `Phân tích tiến độ chiến dịch %s`\n- `Người dùng [userId] đã quyên góp bao nhiêu trong chiến dịch %s`",
                        campaign.getTitle(), campaign.getId(), campaign.getId(), campaign.getId(), campaign.getId()))
                .collect(Collectors.joining("\n\n"));
    }


    public void processUserQuestion(GeminiRequest request, String chatId) {
        String userQuestion = request.getUserQuestion();
        if (userQuestion == null || userQuestion.trim().isEmpty()) {
            telegramServiceAdmin.sendTo(chatId, "Vui lòng cung cấp câu hỏi cụ thể hơn để tôi hỗ trợ bạn! 📝");
            return;
        }

        if (userQuestion.toLowerCase().contains("gợi ý câu hỏi") && userQuestion.toLowerCase().contains("mã chiến dịch")) {
            String suggestions = getCampaignQuestionSuggestions();
            telegramServiceAdmin.sendTo(chatId, "\uD83D\uDD39 *Gợi ý câu hỏi theo mã chiến dịch:*\n\n" + suggestions);
            return;
        }

        String intentJson = extractIntent(request);
        try {
            Map<String, String> intentMap = objectMapper.readValue(intentJson, Map.class);
            String intent = intentMap.get("intent");
            String id = intentMap.getOrDefault("campaignId", intentMap.get("donationId"));

            String dataResponse = null;
            switch (intent) {
                case "campaign_statistics" -> {
                    if (!id.isEmpty()) {
                        dataResponse = donationService.getCampaignStatistics(id);
                        File file = donationService.exportDonationsByCampaign(id);
                        telegramServiceAdmin.sendDocument(chatId, file, "📄 *Danh sách giao dịch của chiến dịch:*");
                        file.delete();
                    }
            }

                case "campaign_analyze" -> dataResponse = !id.isEmpty() ? donationService.analyzeCampaignProgress(id) : null;
                case "donation_detail" -> dataResponse = !id.isEmpty() ? donationService.getDonationInfo(id) : null;
                case "donation_status" -> {
                    if (!id.isEmpty()) {
                        Donation donation = donationService.getDonationById(id);
                        if (donation == null) {
                            telegramServiceAdmin.sendTo(chatId, "❌ Không tìm thấy giao dịch với mã: " + id);
                        } else {
                            dataResponse = String.format("Thông tin giao dịch từ hệ thống:\n- Trạng thái: %s", donation.getStatus());
                        }
                    }
                }
                case "donation_amount" -> {
                    if (!id.isEmpty()) {
                        Donation donation = donationService.getDonationById(id);
                        if (donation == null) {
                            telegramServiceAdmin.sendTo(chatId, "❌ Không tìm thấy giao dịch với mã: " + id);
                        } else {
                            dataResponse = String.format("Số tiền của giao dịch từ hệ thống:\n- Số tiền: %,d VND", donation.getAmount());
                        }
                    }
                }
                case "system_statistics" -> dataResponse = donationService.getStatistics();
                case "donation_stats_time" -> {
    String period = intentMap.get("period");
    switch (period) {
        case "week" -> {
            dataResponse = donationService.getWeeklyStatistics();
            File file = donationService.exportWeeklyDonations();
            telegramServiceAdmin.sendDocument(chatId, file, "📄 *Danh sách giao dịch trong tuần:*");
            file.delete();
        }
        case "month" -> {
            dataResponse = donationService.getMonthlyStatistics();
            File file = donationService.exportMonthlyDonations();
            telegramServiceAdmin.sendDocument(chatId, file, "📄 *Danh sách giao dịch trong tháng:*");
            file.delete();
        }
        case "year" -> {
            dataResponse = donationService.getYearlyStatistics();
            File file = donationService.exportYearlyDonations();
            telegramServiceAdmin.sendDocument(chatId, file, "📄 *Danh sách giao dịch trong năm:*");
            file.delete();
        }
    }
}

                case "campaign_stats_all" -> dataResponse = donationService.getAllCampaignsStatistics();
                case "donation_by_user" -> {
                    if (id != null && !id.isEmpty()) {
                        long count = donationService.getDonationCountByUserId(id);
                        Long sum = donationService.getTotalAmountByUserId(id);
                        dataResponse = String.format("Người dùng %s đã quyên góp %,d VND qua %d giao dịch.", id, sum != null ? sum : 0, count);
                    }
                }
                case "donation_by_user_in_campaign" -> {
                    String userId = intentMap.get("userId");
                    String campaignId = intentMap.get("campaignId");
                    if (userId != null && campaignId != null && !userId.isEmpty() && !campaignId.isEmpty()) {
                        Long amount = donationRepository.sumByUserIdAndCampaignId(userId, campaignId);
                        long count = donationRepository.countByUserIdAndCampaignId(userId, campaignId);
                        dataResponse = String.format("Người dùng %s đã quyên góp %,d VND (%d giao dịch) trong chiến dịch %s.", userId, amount != null ? amount : 0, count, campaignId);
                    }
                }
            }

            if (dataResponse != null) {
                String enrichedPrompt = NATURAL_PROMPT + "\nDữ liệu từ hệ thống:\n" + dataResponse;
                String response = callGeminiApi(userQuestion, enrichedPrompt);
                handleResponseWithSuggestions(chatId, intent, intentMap.get("campaignId"), response);
            } else if ("unknown".equals(intent)) {
                String response = callGeminiApi(userQuestion, NATURAL_PROMPT);
                telegramServiceAdmin.sendTo(chatId, response);
            } else {
                telegramServiceAdmin.sendTo(chatId, "Vui lòng cung cấp mã chiến dịch hoặc giao dịch để tôi có thể hỗ trợ bạn! 📝");
            }
        } catch (Exception e) {
            log.error("❌ Lỗi khi xử lý câu hỏi: {}", userQuestion, e);
            telegramServiceAdmin.sendTo(chatId, "⚠️ Không thể xử lý câu hỏi lúc này. Vui lòng thử lại sau. 😔");
        }
    }

    public String askGemini(GeminiRequest request) {
        String systemPrompt = request.getSystemPrompt() != null ? request.getSystemPrompt() : NATURAL_PROMPT;
        return callGeminiApi(request.getUserQuestion(), systemPrompt);
    }

    public String extractIntent(GeminiRequest request) {
        String raw = callGeminiApi(request.getUserQuestion(), INTENT_PROMPT);
        return cleanMarkdownJson(raw);
    }

    private String cleanMarkdownJson(String input) {
        if (input == null) return "{}";
        String cleaned = input.trim();
        if (cleaned.startsWith("```") && cleaned.endsWith("```") && cleaned.length() > 6) {
            cleaned = cleaned.replaceAll("(?s)```(?:json)?\\s*", "").replaceAll("(?s)\\s*```", "").trim();
        }
        return cleaned;
    }

    private String callGeminiApi(String userText, String systemPrompt) {
        try {
            if (userText == null || userText.isBlank()) {
                log.warn("⚠️ userText rỗng hoặc null khi gọi Gemini API.");
                return systemPrompt.contains("intent") ? "{\"intent\": \"unknown\"}" : "Không thể xử lý yêu cầu AI lúc này. 😔";
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String combinedPrompt = systemPrompt + "\n\nNgười dùng hỏi: " + userText;

            Map<String, Object> message = Map.of(
                    "contents",
                    List.of(
                            Map.of("role", "user", "parts", List.of(Map.of("text", combinedPrompt)))));

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(message, headers);
            String fullUrl = geminiApiUrl + "?key=" + geminiApiKey;

            ResponseEntity<Map> response = restTemplate.postForEntity(fullUrl, requestEntity, Map.class);
            Map candidate = (Map) ((List<?>) response.getBody().get("candidates")).get(0);
            Map content = (Map) candidate.get("content");
            List<Map> parts = (List<Map>) content.get("parts");

            return parts.get(0).get("text").toString();

        } catch (Exception e) {
            log.error("❌ Lỗi khi gọi Gemini API", e);
            String errorMessage = e.getMessage();
            if (errorMessage != null && errorMessage.contains("400") && errorMessage.contains("Content with system role is not supported")) {
                return "Lỗi: Gemini API không hỗ trợ vai trò system. Vui lòng kiểm tra lại cấu hình API. 😔";
            }
            return "Không thể xử lý yêu cầu AI lúc này: " + (errorMessage != null ? errorMessage : "Lỗi không xác định") + " 😔";
        }
    }
}
