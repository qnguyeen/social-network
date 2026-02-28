package com.LinkVerse.post.service;



import com.LinkVerse.identity.dto.response.UserInfoResponse;
import com.LinkVerse.post.Mapper.StoryMapper;
import com.LinkVerse.post.dto.ApiResponse;
import com.LinkVerse.post.dto.PageResponse;
import com.LinkVerse.post.dto.request.StoryCreationRequest;
import com.LinkVerse.post.dto.response.StoryResponse;
import com.LinkVerse.post.entity.Story;
import com.LinkVerse.post.entity.StoryVisibility;
import com.LinkVerse.post.exception.AppException;
import com.LinkVerse.post.exception.ErrorCode;
import com.LinkVerse.post.repository.StoryRepository;
import com.LinkVerse.post.repository.client.IdentityServiceClient;
import com.LinkVerse.post.repository.client.ProfileServiceClient;
import com.LinkVerse.post.service.RekognitionService;
import com.LinkVerse.post.service.S3ServiceStory;
import com.amazonaws.services.s3.model.S3Object;
import feign.FeignException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StoryService {

    StoryRepository storyRepository;
    StoryMapper storyMapper;
    S3ServiceStory s3ServiceStory;
    RekognitionService rekognitionService;
    ProfileServiceClient profileServiceClient;
    IdentityServiceClient identityServiceClient;
    static final int STORY_EXPIRATION_HOURS = 24;

       public ApiResponse<StoryResponse> createStory(StoryCreationRequest request, List<MultipartFile> files) {
        String userId = getCurrentUserId();

        if (files == null || files.stream().allMatch(MultipartFile::isEmpty)) {
            return ApiResponse.<StoryResponse>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message("Cần ít nhất một tệp hình ảnh hoặc video để tạo hoặc cập nhật story")
                    .build();
        }

        UserInfoResponse userInfo = getUserInfoWithFallback(userId);
        List<String> fileUrls = s3ServiceStory.uploadFiles(files.stream().filter(file -> !file.isEmpty()).collect(Collectors.toList()));
        List<String> validUrls = new ArrayList<>();

        for (String fileUrl : fileUrls) {
            String fileName = extractFileNameFromUrl(decodeUrl(fileUrl));
            S3Object s3Object = s3ServiceStory.getObject(fileName);
            String contentType = s3Object.getObjectMetadata().getContentType();

            if (contentType != null && contentType.startsWith("image/")) {
                if (rekognitionService.isImageSafe(s3Object)) {
                    validUrls.add(fileUrl);
                } else {
                    s3ServiceStory.deleteFile(fileName);
                    log.warn("❌ Đã xóa ảnh không an toàn: {}", fileName);
                }
            } else if (contentType != null && contentType.startsWith("video/")) {
                log.info("🎥 Video được chấp nhận, bỏ qua kiểm duyệt Rekognition: {}", fileName);
                validUrls.add(fileUrl);
            } else {
                log.warn("⚠️ Định dạng không hỗ trợ ({}): {}", contentType, fileName);
                s3ServiceStory.deleteFile(fileName);
            }
        }

        if (validUrls.isEmpty()) {
            return ApiResponse.<StoryResponse>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message("Không có nội dung hợp lệ nào được cung cấp cho story")
                    .build();
        }

        Optional<Story> existingStoryOpt = storyRepository.findByUserIdAndExpiryTimeAfter(userId, LocalDateTime.now());
        Story story;

        if (existingStoryOpt.isPresent()) {
            story = existingStoryOpt.get();
            List<String> currentImageUrls = story.getImageUrls() != null ? new ArrayList<>(story.getImageUrls()) : new ArrayList<>();
            currentImageUrls.addAll(validUrls);
            story.setImageUrls(currentImageUrls);
            if (request.getContent() != null) {
                story.setContent(request.getContent());
            }
            story.setUsername(userInfo.getUsername());
            story.setImageUrl(userInfo.getImageUrl());
        } else {
            story = storyMapper.toEntity(request);
            story.setUserId(userId);
            story.setUsername(userInfo.getUsername());
            story.setImageUrl(userInfo.getImageUrl());
            story.setImageUrls(validUrls);
            story.setPostedAt(LocalDateTime.now());
            story.setExpiryTime(story.getPostedAt().plusHours(STORY_EXPIRATION_HOURS));
            story.setVisibility(request.getVisibility() != null ? request.getVisibility() : StoryVisibility.PUBLIC);
        }

        Story savedStory = storyRepository.save(story);
        StoryResponse storyResponse = storyMapper.toResponse(savedStory);

        return ApiResponse.<StoryResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Story được tạo hoặc cập nhật thành công")
                .result(storyResponse)
                .build();
    }

    public ApiResponse<PageResponse<StoryResponse>> getAllStories(int page, int size) {
        if (page < 1 || size < 1) {
            return ApiResponse.<PageResponse<StoryResponse>>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message("Page và size phải lớn hơn 0")
                    .build();
        }

        String currentUserId = getCurrentUserId();
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Order.desc("postedAt")));
        Page<Story> pageData = storyRepository.findAll(pageable);

        List<Story> stories = pageData.getContent().stream()
                .filter(story -> story.getExpiryTime().isAfter(LocalDateTime.now()))
                .filter(story -> story.getVisibility() == StoryVisibility.PUBLIC)
                .filter(story -> {
                    String storyUserId = story.getUserId();
                    return !profileServiceClient.isBlocked(currentUserId, storyUserId) &&
                            !profileServiceClient.isBlocked(storyUserId, currentUserId);
                })
                .collect(Collectors.toList());

        Set<String> userIdsToFetch = stories.stream()
                .filter(story -> story.getUsername() == null || story.getImageUrl() == null)
                .map(Story::getUserId)
                .collect(Collectors.toSet());
        Map<String, UserInfoResponse> userInfoMap = userIdsToFetch.isEmpty() ? new HashMap<>() : batchFetchUserInfo(userIdsToFetch);

        List<StoryResponse> storyResponses = stories.stream()
                .map(story -> {
                    StoryResponse storyResponse = storyMapper.toResponse(story);
                    String username = story.getUsername() != null ? story.getUsername() :
                            userInfoMap.getOrDefault(story.getUserId(),
                                    new UserInfoResponse("Unknown", null)).getUsername();
                    String imageUrl = story.getImageUrl() != null ? story.getImageUrl() :
                            userInfoMap.getOrDefault(story.getUserId(),
                                    new UserInfoResponse(null, "https://your-default-image.com/default-avatar.png")).getImageUrl();
                    storyResponse.setUsername(username);
                    storyResponse.setImageUrl(imageUrl);
                    return storyResponse;
                })
                .collect(Collectors.toList());

        return ApiResponse.<PageResponse<StoryResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách story thành công")
                .result(PageResponse.<StoryResponse>builder()
                        .currentPage(page)
                        .pageSize(size)
                        .totalPage(pageData.getTotalPages())
                        .totalElement(pageData.getTotalElements())
                        .data(storyResponses)
                        .build())
                .build();
    }

    public ApiResponse<PageResponse<StoryResponse>> getStoriesByUser(int page, int size, String userId) {
        if (page < 1 || size < 1) {
            return ApiResponse.<PageResponse<StoryResponse>>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message("Page và size phải lớn hơn 0")
                    .build();
        }

        String currentUserId = getCurrentUserId();
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Order.desc("postedAt")));
        Page<Story> pageData = storyRepository.findByUserId(userId, pageable);

        List<Story> stories = pageData.getContent().stream()
                .filter(story -> story.getExpiryTime().isAfter(LocalDateTime.now()))
                .filter(story -> story.getVisibility() == StoryVisibility.PUBLIC ||
                        (story.getVisibility() == StoryVisibility.PRIVATE && story.getUserId().equals(currentUserId)))
                .collect(Collectors.toList());

        Set<String> userIdsToFetch = stories.stream()
                .filter(story -> story.getUsername() == null || story.getImageUrl() == null)
                .map(Story::getUserId)
                .collect(Collectors.toSet());
        Map<String, UserInfoResponse> userInfoMap = userIdsToFetch.isEmpty() ? new HashMap<>() : batchFetchUserInfo(userIdsToFetch);

        List<StoryResponse> storyResponses = stories.stream()
                .map(story -> {
                    StoryResponse storyResponse = storyMapper.toResponse(story);
                    String username = story.getUsername() != null ? story.getUsername() :
                            userInfoMap.getOrDefault(story.getUserId(),
                                    new UserInfoResponse("Unknown", null)).getUsername();
                    String imageUrl = story.getImageUrl() != null ? story.getImageUrl() :
                            userInfoMap.getOrDefault(story.getUserId(),
                                    new UserInfoResponse(null, "https://res.cloudinary.com/duktr2ml5/image/upload/v1745753671/blankavatar_fupmly.jpg")).getImageUrl();
                    storyResponse.setUsername(username);
                    storyResponse.setImageUrl(imageUrl);
                    return storyResponse;
                })
                .collect(Collectors.toList());

        return ApiResponse.<PageResponse<StoryResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy story của người dùng thành công")
                .result(PageResponse.<StoryResponse>builder()
                        .currentPage(page)
                        .pageSize(size)
                        .totalPage(pageData.getTotalPages())
                        .totalElement(pageData.getTotalElements())
                        .data(storyResponses)
                        .build())
                .build();
    }

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return authentication.getName();
    }

    private String extractFileNameFromUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            throw new IllegalArgumentException("URL tệp không hợp lệ");
        }
        return fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
    }

    private String decodeUrl(String encodedUrl) {
        return URLDecoder.decode(encodedUrl, StandardCharsets.UTF_8);
    }

    private UserInfoResponse getUserInfoWithFallback(String userId) {
        try {
            UserInfoResponse userInfo = identityServiceClient.getUserInfo(userId);
            if (userInfo == null || userInfo.getUsername() == null) {
                log.warn("Thông tin người dùng null hoặc không đầy đủ cho userId: {}", userId);
                return new UserInfoResponse("Unknown", "https://res.cloudinary.com/duktr2ml5/image/upload/v1745753671/blankavatar_fupmly.jpg");
            }
            log.info("Lấy thông tin người dùng thành công cho userId {}: {} - {}", userId, userInfo.getUsername(), userInfo.getImageUrl());
            return userInfo;
        } catch (FeignException e) {
            log.error("Lỗi Feign khi lấy thông tin người dùng cho userId {}: Status {}, Message: {}", userId, e.status(), e.getMessage(), e);
            return new UserInfoResponse("Unknown", "https://res.cloudinary.com/duktr2ml5/image/upload/v1745753671/blankavatar_fupmly.jpg");
        } catch (Exception e) {
            log.error("Lỗi không xác định khi lấy thông tin người dùng cho userId {}: {}", userId, e.getMessage(), e);
            return new UserInfoResponse("Unknown", "https://res.cloudinary.com/duktr2ml5/image/upload/v1745753671/blankavatar_fupmly.jpg");
        }
    }

    private Map<String, UserInfoResponse> batchFetchUserInfo(Set<String> userIds) {
        Map<String, UserInfoResponse> userInfoMap = new HashMap<>();
        for (String userId : userIds) {
            userInfoMap.put(userId, getUserInfoWithFallback(userId));
        }
        return userInfoMap;
    }
}