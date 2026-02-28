package com.LinkVerse.Support.service;

import com.LinkVerse.Support.dto.request.GeminiRequest;
import com.LinkVerse.Support.model.Answer;
import com.LinkVerse.Support.model.Questionn;

public interface GeminiService {
    String askGemini(GeminiRequest request);
    String extractIntentJson(GeminiRequest request);
    Answer getAnswer(Questionn questionn);
}
