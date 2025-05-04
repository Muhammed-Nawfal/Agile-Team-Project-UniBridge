// MessageThreadResource.java
package bham.team.web.rest;

import bham.team.domain.MessageThread;
import bham.team.domain.Profile;
import bham.team.repository.ProfileRepository;
import bham.team.service.MessageThreadService;
import java.security.Principal;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class MessageThreadResource {

    private final MessageThreadService messageThreadService;
    private final ProfileRepository profileRepository;

    public MessageThreadResource(MessageThreadService messageThreadService, ProfileRepository profileRepository) {
        this.messageThreadService = messageThreadService;
        this.profileRepository = profileRepository;
    }

    @GetMapping("/my-message-threads")
    public List<MessageThread> getMyMessageThreads(Principal principal) {
        Profile profile = profileRepository
            .findByUserLogin(principal.getName())
            .orElseThrow(() -> new RuntimeException("Profile not found"));

        return messageThreadService.getThreadsForProfile(profile.getId());
    }

    @GetMapping("/friends-list/{friendsListId}/thread")
    public ResponseEntity<MessageThread> getOrCreateThreadForFriends(@PathVariable Long friendsListId) {
        MessageThread thread = messageThreadService.getOrCreateThreadForFriends(friendsListId);
        return ResponseEntity.ok(thread);
    }
}
