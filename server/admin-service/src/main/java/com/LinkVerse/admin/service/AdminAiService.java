package com.LinkVerse.admin.service;

import com.LinkVerse.admin.dto.request.GeminiRequest;
import com.LinkVerse.admin.repository.client.IdentityServiceClient;
import com.LinkVerse.admin.repository.client.StaticServiceClient;
import com.LinkVerse.identity.dto.request.AdminPasswordChangeRequest;
import com.LinkVerse.statistics.entity.CampaignStatics;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminAiService {

    private final GeminiService geminiService;
    private final IdentityServiceClient identityServiceClient;
    private final StaticServiceClient staticServiceClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String handleAdminCommand(String userMessage) {
        GeminiRequest intentRequest = new GeminiRequest(userMessage, getIntentPrompt());
        String intentJson = geminiService.askGemini(intentRequest);

        log.debug("🔍 AI raw response:\n{}", intentJson);

        intentJson = sanitizeRawJson(intentJson);

        if (intentJson == null || !intentJson.trim().startsWith("{")) {
            return "⚠️ AI không trả về định dạng JSON hợp lệ. Vui lòng kiểm tra lại prompt hoặc câu hỏi.";
        }
        try {
            JsonNode intent = objectMapper.readTree(intentJson);
            String action = intent.path("intent").asText(null);

            if (action == null) {
                return "⚠️ AI không thể xác định intent.";
            }

            if (action.equals("greeting")) {
                return "👋 Chào bạn! Tôi có thể giúp bạn với các thao tác quản trị như khoá/mở khoá tài khoản, xoá tài khoản, đổi mật khẩu, thống kê người dùng, bài viết, chiến dịch...";
            }

            return switch (action) {
                case "lock_user", "unlock_user", "delete_user", "change_password" -> {
                    String userId = intent.path("userId").asText(null);
                    if (userId == null || userId.isBlank()) {
                        yield "⚠️ Thiếu userId cho hành động: " + action;
                    }
                    log.info("🔍 AI xác định intent: {}, userId: {}", action, userId);
                    yield switch (action) {
                        case "lock_user" -> identityServiceClient.lockUser(userId).getBody().getMessage();
                        case "unlock_user" -> identityServiceClient.unlockUser(userId).getBody().getMessage();
                        case "delete_user" -> identityServiceClient.deleteUserByAdmin(userId).getBody().getMessage();
                        case "change_password" -> {
                            String newPassword = intent.path("newPassword").asText("");
                            String confirmPassword = intent.path("confirmPassword").asText("");
                            AdminPasswordChangeRequest request = new AdminPasswordChangeRequest(userId, newPassword, confirmPassword);
                            yield identityServiceClient.adminChangePassword(request).getBody().getMessage();
                        }
                        default -> "❌ Hành động không được hỗ trợ: " + action;
                    };
                }
                case "get_campaign_stats" -> staticServiceClient.getCampaignStatistics().getBody().toString();
                case "get_top_campaigns" -> staticServiceClient.getTop10ByTargetAmount().getBody().toString();
                case "get_avg_campaign_duration" -> staticServiceClient.getAverageCampaignCompletionDuration().getBody().toString();
                case "get_donation_stats" -> staticServiceClient.getAllDonationStatistics().getBody().toString();
                case "get_user_stats" -> staticServiceClient.getUserStatistics().getBody().toString();
                case "get_post_stats" -> staticServiceClient.getPostStatistics().getBody().toString();
                case "get_group_stats" -> staticServiceClient.getGroupStatistics().getBody().toString();
                case "get_top10_groups" -> staticServiceClient.getTop10Groups().getBody().toString();
                case "get_user_chart" -> {
                    LocalDate start = LocalDate.now().minusDays(30);
                    LocalDate end = LocalDate.now();
                    yield staticServiceClient.getRegistrationChart(start, end).getBody().toString();
                }
                default -> "❌ Hành động không được hỗ trợ: " + action;
            };

        } catch (Exception e) {
            log.error("❌ Lỗi phân tích JSON từ AI: {}", intentJson, e);
            return "❌ AI không thể phân tích yêu cầu. Vui lòng thử lại.";
        }
    }

    private String sanitizeRawJson(String raw) {
        if (raw == null) return null;

        raw = raw.trim();

        if (raw.startsWith("```") || raw.startsWith("`")) {
            raw = raw.replaceAll("```[a-zA-Z]*", "") // remove ``` or ```json
                     .replaceAll("```", "")
                     .replaceAll("`+", "")
                     .trim();
        }

        int endIdx = raw.lastIndexOf("}");
        if (endIdx != -1) {
            raw = raw.substring(0, endIdx + 1);
        }

        return raw;
    }

    private String getIntentPrompt() {
        return """
                Bạn là AI trợ lý quản trị viên của LinkVerse.
                Dựa vào câu lệnh quản trị bên dưới, hãy **trả về đúng JSON** theo cấu trúc sau:

                Ví dụ:
                - \"Khóa tài khoản abc123\" => {\"intent\": \"lock_user\", \"userId\": \"abc123\"}
                - \"Mở khóa tài khoản xyz\" => {\"intent\": \"unlock_user\", \"userId\": \"xyz\"}
                - \"Xóa tài khoản người dùng 123\" => {\"intent\": \"delete_user\", \"userId\": \"123\"}
                - \"Đổi mật khẩu cho người dùng abc123 thành 123456\" => {
                    \"intent\": \"change_password\",
                    \"userId\": \"abc123\",
                    \"newPassword\": \"123456\",
                    \"confirmPassword\": \"123456\"
                }
                - \"Thống kê các chiến dịch quyên góp\" => {\"intent\": \"get_campaign_stats\"}
                - \"Top chiến dịch có số tiền mục tiêu cao\" => {\"intent\": \"get_top_campaigns\"}
                - \"Thời gian hoàn thành chiến dịch trung bình\" => {\"intent\": \"get_avg_campaign_duration\"}
                - \"Tổng số lượt quyên góp là bao nhiêu\" => {\"intent\": \"get_donation_stats\"}
                - \"Tổng số người dùng\" => {\"intent\": \"get_user_stats\"}
                - \"Thống kê bài viết\" => {\"intent\": \"get_post_stats\"}
                - \"Thống kê nhóm\" => {\"intent\": \"get_group_stats\"}
                - \"Top 10 nhóm đóng góp\" => {\"intent\": \"get_top10_groups\"}
                - \"Số người dùng đăng ký trong 30 ngày qua\" => {\"intent\": \"get_user_chart\"}

                Ngoài ra, nếu người dùng chỉ chào hỏi hoặc trò chuyện (ví dụ: \"Xin chào\", \"Bạn là ai\", \"Cảm ơn\"), hãy trả về:
                {\"intent\": \"greeting\"}

                Nếu không hiểu yêu cầu, trả về:
                {\"intent\": \"unknown\"}

                ❗Bắt buộc: chỉ trả về JSON thuần, không kèm chú thích hay bất kỳ văn bản nào khác.
                """;
    }
}
