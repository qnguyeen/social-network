package com.LinkVerse.identity.mapper;

import com.LinkVerse.identity.dto.response.ChatResponse;
import com.LinkVerse.identity.dto.response.UserResponse;
import com.LinkVerse.identity.entity.Chat;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
public class ChatMapper {
    @Autowired
    private UserMapper userMapper;

    public ChatResponse toChatResponse(Chat chat) {
        Set<UserResponse> userResponses =
                chat.getUsers().stream().map(userMapper::toUserResponse).collect(Collectors.toSet());

        return ChatResponse.builder()
                .id(chat.getId())
                .chatName(chat.getChatName())
                .chatImage(chat.getChatImage())
                .isGroup(chat.isGroup())
                .users(userResponses)
                .build();
    }
}
