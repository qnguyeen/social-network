package com.LinkVerse.notification.repository;

import com.LinkVerse.notification.entity.OtpRequest;
import com.LinkVerse.notification.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OtpRequestRepository extends JpaRepository<OtpRequest, Long> {
    Optional<OtpRequest> findByUser(User user);
}
