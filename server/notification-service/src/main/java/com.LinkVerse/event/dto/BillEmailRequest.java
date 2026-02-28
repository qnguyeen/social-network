package com.LinkVerse.event.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillEmailRequest {
    private String userId;
    private String campaignTitle;
    private long amount;
    private String donorName;
    private LocalDateTime time;
}
