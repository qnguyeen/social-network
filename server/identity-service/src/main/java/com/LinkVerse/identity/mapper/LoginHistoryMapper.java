package com.LinkVerse.identity.mapper;

import com.LinkVerse.identity.dto.request.LoginHistoryRequest;
import com.LinkVerse.identity.entity.LoginHistory;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface LoginHistoryMapper {
    LoginHistoryRequest toDto(LoginHistory entity);

    List<LoginHistoryRequest> toDto(List<LoginHistory> entities);
}
