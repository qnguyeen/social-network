package com.LinkVerse.post.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostStatisticResponse {
    private long totalPosts;
    private long totalLikes;
    private long totalComments;
    private LocalDate date;

}
