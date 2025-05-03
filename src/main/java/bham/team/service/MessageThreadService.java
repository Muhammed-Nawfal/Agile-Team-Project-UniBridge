// MessageThreadService.java
package bham.team.service;

import bham.team.domain.FriendsList;
import bham.team.domain.MessageThread;
import bham.team.domain.Profile;
import bham.team.repository.FriendsListRepository;
import bham.team.repository.MessageThreadRepository;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MessageThreadService {

    private final MessageThreadRepository messageThreadRepository;
    private final FriendsListRepository friendsListRepository;

    public MessageThreadService(MessageThreadRepository messageThreadRepository, FriendsListRepository friendsListRepository) {
        this.messageThreadRepository = messageThreadRepository;
        this.friendsListRepository = friendsListRepository;
    }

    public MessageThread getOrCreateThreadForFriends(Long friendsListId) {
        // Check if thread already exists
        Optional<MessageThread> existingThread = messageThreadRepository.findByFriendChatId(friendsListId);
        if (existingThread.isPresent()) {
            return existingThread.get();
        }

        // Create new thread
        FriendsList friendsList = friendsListRepository
            .findById(friendsListId)
            .orElseThrow(() -> new RuntimeException("Friends list not found"));

        MessageThread thread = new MessageThread();
        thread.setFriendChat(friendsList);
        thread.setIsGroup(false);
        thread.setCreatedOn(Instant.now());

        // Add participants
        Set<Profile> participants = new HashSet<>();
        participants.add(friendsList.getRequestedByProfile());
        participants.add(friendsList.getRequestedToProfile());
        thread.setParticipants(participants);

        return messageThreadRepository.save(thread);
    }

    public List<MessageThread> getThreadsForProfile(Long profileId) {
        return messageThreadRepository.findFriendThreadsByProfileId(profileId);
    }
}
