package com.LinkVerse.identity.repository;

import com.LinkVerse.identity.entity.Message;
import com.LinkVerse.identity.entity.MessageReadStatus;
import com.LinkVerse.identity.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MessageReadStatusRepository extends JpaRepository<MessageReadStatus, Long> {
    List<MessageReadStatus> findByMessage_Id(Integer messageId);
    Optional<MessageReadStatus> findByMessageAndUser(Message message, User user);
}
