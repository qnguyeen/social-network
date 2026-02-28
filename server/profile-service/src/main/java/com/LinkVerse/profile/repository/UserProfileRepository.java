package com.LinkVerse.profile.repository;

import com.LinkVerse.profile.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, String> {
    Optional<UserProfile> findByUserId(String userId);

    Optional<UserProfile> findById(String id);

    UserProfile findUserProfileByUserId(String id);
}
