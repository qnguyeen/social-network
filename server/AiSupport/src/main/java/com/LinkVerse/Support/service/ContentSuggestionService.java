package com.LinkVerse.Support.service;

import com.LinkVerse.Support.model.Answer;
import com.LinkVerse.Support.model.Questionn;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@RequiredArgsConstructor
@Service
@Slf4j
public class ContentSuggestionService {

    private final GeminiServiceImpl geminiServiceImpl;
    private final LanguageDetectService languageDetectService;

    public List<String> suggestContent(String content) {
        String lang = languageDetectService.detectLanguage(content);
        log.info("📘 Detected language for suggestion: {}", lang);

        String prompt = switch (lang == null ? "vi" : lang.toLowerCase()) {
            case "vi", "vietnamese" -> getVietnameseSuggestionPrompt(content);
            case "en", "english" -> getEnglishSuggestionPrompt(content);
            default -> getVietnameseSuggestionPrompt(content);
        };

        Answer answer = geminiServiceImpl.getAnswer(new Questionn(prompt));

        return Arrays.stream(answer.answer().split("###"))
                .map(this::removeAnswerPrefix)
                .map(this::cleanLines)
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();
    }

    public String generatePostFromAI(String inputText) {
        String lang = languageDetectService.detectLanguage(inputText);
        log.info("📘 Detected language: {}", lang);

        if (lang == null || lang.isBlank()) lang = "vi";

        String prompt = switch (lang.toLowerCase()) {
            case "vi", "vietnamese" -> getVietnamesePromptWithHashtag(inputText);
            case "en", "english" -> getEnglishPromptWithHashtag(inputText);
            default -> getVietnamesePromptWithHashtag(inputText);
        };

        Answer answer = geminiServiceImpl.getAnswer(new Questionn(prompt));
        return extractContentOnly(answer.answer());
    }

    private String getVietnameseSuggestionPrompt(String content) {
        return """
                Bạn là một trợ lý AI chuyên giúp tối ưu nội dung bài đăng trên mạng xã hội.

                - Hãy đưa ra **3 phiên bản cải tiến** của bài đăng bên dưới.
                - Mỗi phiên bản phải có phong cách khác nhau: 
                  1. Ngắn gọn & vui nhộn 🎉
                  2. Chuyên nghiệp & lôi cuốn 💼
                  3. Cảm xúc & truyền cảm hứng ❤️
                - Không giải thích, không kèm tiêu đề như \"Gợi ý\", chỉ trả về 3 phiên bản.

                Nội dung gốc:
                "%s"

                Hãy trả lời **chỉ với 3 phiên bản**, phân tách bằng dấu `###`.
                """.formatted(content);
    }

    private String getEnglishSuggestionPrompt(String content) {
        return """
                You are a social media content assistant.

                - Provide **3 rewritten versions** of the post below.
                - Each version should have a different tone:
                  1. Short & funny 🎉
                  2. Professional & engaging 💼
                  3. Emotional & inspirational ❤️
                - Do not explain or label. Only return 3 versions.

                Original content:
                "%s"

                Answer with **exactly 3 versions**, separated by `###`.
                """.formatted(content);
    }

    private String getVietnamesePromptWithHashtag(String content) {
        return """
                Bạn là một AI chuyên viết lại nội dung mạng xã hội bằng tiếng Việt.

                - Viết lại nội dung sau theo phong cách tự nhiên, cảm xúc và thu hút hơn.
                - Sau nội dung, hãy gợi ý từ 1 đến 3 hashtag phù hợp với nội dung (bằng tiếng Việt không dấu).
                - Hashtag phải ở dòng cuối cùng, bắt đầu bằng ký tự `#`, cách nhau bằng dấu cách.
                - Không được thêm thông tin ngoài lề.

                Nội dung gốc: "%s"
                """.formatted(content);
    }

    private String getEnglishPromptWithHashtag(String content) {
        return """
                You are an AI that rewrites social media posts.

                - Rewrite the following content to make it more natural, emotional, and engaging.
                - At the end, suggest 1 to 3 relevant hashtags in English.
                - The hashtags must be in the last line, each starting with `#` and separated by spaces.
                - Do NOT add unrelated content.

                Original content: "%s"
                """.formatted(content);
    }

    private String extractContentOnly(String raw) {
        int index = raw.indexOf("\n\n");
        if (index != -1 && raw.length() > index + 2) {
            return raw.substring(index + 2).trim();
        }
        return raw.trim();
    }

    private String removeAnswerPrefix(String s) {
        if (s.contains("Trả lời:")) {
            return s.substring(s.indexOf("Trả lời:") + 8).strip();
        }
        return s;
    }

    private String cleanLines(String s) {
        return Arrays.stream(s.split("\n"))
                .map(line -> line.replaceFirst("^-\\s*", ""))
                .map(String::trim)
                .filter(line -> !line.isBlank())
                .reduce("", (a, b) -> a + (a.isEmpty() ? "" : "\n") + b);
    }
}
