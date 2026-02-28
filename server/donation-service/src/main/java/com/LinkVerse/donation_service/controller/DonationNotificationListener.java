package com.LinkVerse.donation_service.controller;

import com.LinkVerse.donation_service.dto.DonationNotification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DonationNotificationListener {

    private final SimpMessagingTemplate messagingTemplate;

    @KafkaListener(topics = "donation.notifications", groupId = "notification-group")
    public void listen(DonationNotification notification) {
        log.info("Kafka notification: {}", notification);

        messagingTemplate.convertAndSendToUser(notification.getReceiverId(), "/queue/donations", notification);
    }
}
