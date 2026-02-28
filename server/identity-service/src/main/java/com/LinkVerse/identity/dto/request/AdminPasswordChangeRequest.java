package com.LinkVerse.identity.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AdminPasswordChangeRequest {
    private String userId;
    private String newPassword;
    private String confirmPassword;
}
