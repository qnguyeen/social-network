package com.LinkVerse.donation_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "main_ad_campaigns")
public class MainAdCampaign implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
@ElementCollection
    private List<Integer> durations;
    String title; // Tên chiến dịch chính, ví dụ: "Quảng cáo bài viết"
    long targetAmount; // Số tiền cố định mà người dùng phải donation
    String adminId; // ID admin tạo chiến dịch
}