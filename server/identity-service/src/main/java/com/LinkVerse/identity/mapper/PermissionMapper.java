package com.LinkVerse.identity.mapper;

import com.LinkVerse.identity.dto.request.PermissionRequest;
import com.LinkVerse.identity.dto.response.PermissionResponse;
import com.LinkVerse.identity.entity.Permission;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    Permission toPermission(PermissionRequest request);

    PermissionResponse toPermissionResponse(Permission permission);
}
