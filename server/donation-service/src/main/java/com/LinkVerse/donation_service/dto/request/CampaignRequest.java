package com.LinkVerse.donation_service.dto.request;

import jakarta.persistence.ElementCollection;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CampaignRequest {
    String title;
    String description;
    long targetAmount;

    @ElementCollection
    List<String> ImageUrl;
    private List<String> timeSlots;

}
