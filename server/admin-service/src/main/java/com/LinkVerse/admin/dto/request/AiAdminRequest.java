package com.LinkVerse.admin.dto.request;

import lombok.Data;

@Data
public class AiAdminRequest {
    private String command;
    private String userId;
    private String newPassword;
}
