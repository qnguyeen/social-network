package com.LinkVerse.admin.service;

import com.LinkVerse.admin.dto.request.GeminiRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String askGemini(GeminiRequest request) {
    try {
        // Nếu không có systemPrompt, dùng mặc định
        String systemPrompt = request.getSystemPrompt();
        if (systemPrompt == null || systemPrompt.isBlank()) {
            systemPrompt = """
                Bạn là trợ lý quản trị viên của hệ thống LinkVerse.
                Hãy trả lời bằng tiếng Việt, ngắn gọn, lịch sự, và đúng trọng tâm.
                """;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> message = Map.of(
            "contents", List.of(
                Map.of("role", "user", "parts", List.of(Map.of("text", systemPrompt))),
                Map.of("role", "user", "parts", List.of(Map.of("text", request.getUserQuestion())))
            )
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(message, headers);
        String fullUrl = geminiApiUrl + "?key=" + geminiApiKey;

        ResponseEntity<Map> response = restTemplate.postForEntity(fullUrl, entity, Map.class);

        Map candidate = (Map) ((List<?>) response.getBody().get("candidates")).get(0);
        Map content = (Map) candidate.get("content");
        List<Map> parts = (List<Map>) content.get("parts");

        return parts.get(0).get("text").toString();

    } catch (Exception e) {
        log.error("❌ Lỗi gọi Gemini API", e);
        return "Không thể xử lý yêu cầu AI lúc này.";
    }
}


}
