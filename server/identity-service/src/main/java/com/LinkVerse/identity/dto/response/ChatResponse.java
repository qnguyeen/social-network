package com.LinkVerse.identity.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
@Builder
public class ChatResponse {
    private Integer id;
    private String chatName;
    private String chatImage;
    private boolean isGroup;
    private Set<UserResponse> users;
}
