package com.LinkVerse.Support.dto.request;

import com.LinkVerse.Support.model.Questionn;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GeminiRequest {
    private String userQuestion;


    @Builder.Default
    private String systemPrompt = "...";



    public Questionn toQuestionn() {
        return new Questionn(userQuestion);
    }
}
