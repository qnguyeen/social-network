package com.LinkVerse.post.service;

import com.LinkVerse.post.entity.Post;
import com.LinkVerse.post.entity.PostGroup;
import com.LinkVerse.post.repository.PostRepository;
import com.LinkVerse.post.repository.PostGroupRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostsStatisticService {
    private final PostRepository postRepository;
    private final PostGroupRepository postGroupRepository;

    public Map<String, Map<String, Long>> getAllPostStatistics() {
        LocalDate now = LocalDate.now();

        // Define time ranges
        LocalDate today = now;
        LocalDate startOfWeek = now.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate startOfYear = now.withDayOfYear(1);

        // Create result map
        Map<String, Map<String, Long>> result = new HashMap<>();

        // Get statistics for each time period
        result.put("today", getPostStatisticsByDateRange(today, today));
        result.put("thisweek", getPostStatisticsByDateRange(startOfWeek, now));
        result.put("thismonth", getPostStatisticsByDateRange(startOfMonth, now));
        result.put("thisyear", getPostStatisticsByDateRange(startOfYear, now));
        result.put("all", getAllTimePostStatistics());

        return result;
    }

    private Map<String, Long> getPostStatisticsByDateRange(LocalDate startDate, LocalDate endDate) {
        Instant start = startDate.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant end = endDate.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        // Fetch Posts and PostGroups
        List<Post> posts = postRepository.findAllByCreatedDateBetween(start, end);
        List<PostGroup> postGroups = postGroupRepository.findAllByCreatedDateBetween(start, end);

        // Aggregate statistics
        long totalPosts = posts.size() + postGroups.size();
        long totalLikes = posts.stream().mapToLong(Post::getLike).sum() +
                postGroups.stream().mapToLong(PostGroup::getLike).sum();
        long totalComments = posts.stream().mapToLong(Post::getCommentCount).sum() +
                postGroups.stream().mapToLong(PostGroup::getCommentCount).sum();

        Map<String, Long> result = new HashMap<>();
        result.put("totalPosts", totalPosts);
        result.put("totalLikes", totalLikes);
        result.put("totalComments", totalComments);
        return result;
    }

    private Map<String, Long> getAllTimePostStatistics() {
        // Fetch all Posts and PostGroups
        List<Post> posts = postRepository.findAll();
        List<PostGroup> postGroups = postGroupRepository.findAll();

        // Aggregate statistics
        long totalPosts = posts.size() + postGroups.size();
        long totalLikes = posts.stream().mapToLong(Post::getLike).sum() +
                postGroups.stream().mapToLong(PostGroup::getLike).sum();
        long totalComments = posts.stream().mapToLong(Post::getCommentCount).sum() +
                postGroups.stream().mapToLong(PostGroup::getCommentCount).sum();

        Map<String, Long> result = new HashMap<>();
        result.put("totalPosts", totalPosts);
        result.put("totalLikes", totalLikes);
        result.put("totalComments", totalComments);
        return result;
    }
}