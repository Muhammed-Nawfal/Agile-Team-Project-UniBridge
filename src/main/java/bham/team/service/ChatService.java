// ChatService.java
package bham.team.service;

import bham.team.domain.Chat;
import bham.team.domain.MessageThread;
import bham.team.domain.Profile;
import bham.team.domain.enumeration.MessageStatus;
import bham.team.repository.ChatRepository;
import bham.team.repository.MessageThreadRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ChatService {

    private final ChatRepository chatRepository;
    private final MessageThreadRepository messageThreadRepository;

    public ChatService(ChatRepository chatRepository, MessageThreadRepository messageThreadRepository) {
        this.chatRepository = chatRepository;
        this.messageThreadRepository = messageThreadRepository;
    }

    public Chat sendMessage(Long threadId, Profile sender, Profile receiver, Chat chat) {
        MessageThread thread = messageThreadRepository
            .findById(threadId)
            .orElseThrow(() -> new RuntimeException("Message thread not found"));

        chat.setMessageThread(thread);
        chat.setSender(sender);
        chat.setReceiver(receiver);
        chat.setTimestamp(Instant.now());
        chat.setCreatedOn(Instant.now());
        chat.setStatus(MessageStatus.SENT);
        chat.setIsDeleted(false);

        // Update thread's updatedOn timestamp
        thread.setUpdatedOn(Instant.now());
        messageThreadRepository.save(thread);

        return chatRepository.save(chat);
    }

    public List<Chat> getMessagesByThreadId(Long threadId) {
        return chatRepository.findActiveMessagesByThreadId(threadId);
    }

    public void markMessagesAsRead(Long threadId, Long profileId) {
        List<Chat> unreadMessages = chatRepository.findByMessageThreadIdOrderByTimestampAsc(threadId);
        unreadMessages
            .stream()
            .filter(chat -> chat.getReceiver().getId().equals(profileId) && chat.getStatus() != MessageStatus.READ)
            .forEach(chat -> {
                chat.setStatus(MessageStatus.READ);
                chatRepository.save(chat);
            });
    }
}
