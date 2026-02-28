package com.LinkVerse.Support.service;

import com.LinkVerse.Support.configuration.VectorStoreProperties;
import com.LinkVerse.Support.dto.request.GeminiRequest;
import com.LinkVerse.Support.model.Answer;
import com.LinkVerse.Support.model.Question;
import com.LinkVerse.Support.model.Questionn;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Service
@Slf4j
public class GeminiServiceImpl implements GeminiServicee {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate;

    public String askGemini(GeminiRequest request) {
        return askGemini(request.getSystemPrompt(), request.getUserQuestion());
    }

    public String askGemini(String systemPrompt, String userPrompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> message = Map.of(
                    "contents", List.of(
                            Map.of("role", "user", "parts", List.of(Map.of("text", systemPrompt))),
                            Map.of("role", "user", "parts", List.of(Map.of("text", userPrompt)))
                    )
            );

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(message, headers);
            String fullUrl = apiUrl + "?key=" + apiKey;

            ResponseEntity<Map> response = restTemplate.postForEntity(fullUrl, requestEntity, Map.class);
            Map candidate = (Map) ((List<?>) response.getBody().get("candidates")).get(0);
            Map content = (Map) candidate.get("content");
            List<Map> parts = (List<Map>) content.get("parts");

            return parts.get(0).get("text").toString();
        } catch (Exception e) {
            log.error("❌ Lỗi gọi Gemini AI", e);
            return "❌ Không thể xử lý yêu cầu AI lúc này.";
        }
    }

    public String askGemini(String prompt) {
        return askGemini("", prompt);
    }

    public String extractIntentJson(GeminiRequest request) {
        return askGemini(request);
    }

    @Override
    public Answer getAnswer(Questionn questionn) {
        return getAnswer(new Question(questionn.getQuestion()));
    }

    public Answer getAnswer(Question question) {
        String prompt = """
                You are an AI assistant. Answer the following question concisely and accurately.

                ### ❓ Question:
                %s

                ### 🎯 Answer Format:
                - Trả lời dưới dạng danh sách nếu cần.
                - Dùng Markdown để hiển thị đẹp hơn.
                - Nếu không tìm thấy thông tin, trả lời: \"Xin lỗi, tôi không có đủ thông tin để trả lời câu hỏi này.\"
                """.formatted(question.question());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = Map.of("contents", List.of(
                Map.of("parts", List.of(Map.of("text", prompt)))
        ));
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                apiUrl + "?key=" + apiKey,
                HttpMethod.POST,
                entity,
                Map.class
        );

        return new Answer(formatAnswer(response.getBody()));
    }

    private String formatAnswer(Map<String, Object> responseBody) {
        if (responseBody == null || !responseBody.containsKey("candidates")) {
            return "Không có phản hồi từ AI.";
        }

        List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
        if (candidates.isEmpty()) return "Không có câu trả lời.";

        Map<String, Object> firstCandidate = candidates.get(0);
        if (!firstCandidate.containsKey("content")) return "Không có nội dung trong phản hồi.";

        Map<String, Object> content = (Map<String, Object>) firstCandidate.get("content");
        if (!content.containsKey("parts")) return "Không có phần nội dung.";

        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
        if (parts.isEmpty() || !parts.get(0).containsKey("text")) return "Không có văn bản trả lời.";

        String answer = (String) parts.get(0).get("text");

        return "### 🎯 Trả lời:\n\n" + answer.replace("\n", "\n- ");
    }
}
