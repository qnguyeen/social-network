package com.LinkVerse.donation_service.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
public class GeminiRequest {
    private String userQuestion;
    private String systemPrompt;
}
