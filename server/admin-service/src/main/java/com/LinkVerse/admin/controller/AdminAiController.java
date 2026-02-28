package com.LinkVerse.admin.controller;

import com.LinkVerse.admin.dto.request.AiAdminRequest;
import com.LinkVerse.admin.dto.request.GeminiRequest;
import com.LinkVerse.admin.service.AdminAiService;
import com.LinkVerse.admin.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/ai")
public class AdminAiController {

    private final AdminAiService adminAiService;
    private final GeminiService geminiService;


@PostMapping("/handle")
public ResponseEntity<String> handleAdminAction(@RequestBody GeminiRequest request) {
    return ResponseEntity.ok(adminAiService.handleAdminCommand(request.getUserQuestion()));
}



    @PostMapping("/ask")
    public ResponseEntity<String> askGemini(@RequestBody GeminiRequest request) {
        String response = geminiService.askGemini(request);
        return ResponseEntity.ok(response);
    }

}
