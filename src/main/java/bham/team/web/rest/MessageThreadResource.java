package bham.team.web.rest;

import bham.team.domain.MessageThread;
import bham.team.domain.Profile;
import bham.team.repository.ProfileRepository;
import bham.team.service.MessageThreadService;
import java.security.Principal;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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

    /**
     * GET  /message-threads : get all threads for the current user.
     */
    @GetMapping("/message-threads")
    public ResponseEntity<List<MessageThread>> getAllThreads(Principal principal) {
        Profile me = profileRepository
            .findByUserLogin(principal.getName())
            .orElseThrow(() -> new RuntimeException("Profile not found for user " + principal.getName()));
        List<MessageThread> threads = messageThreadService.getThreadsForProfile(me.getId());
        return ResponseEntity.ok().body(threads);
    }

    /**
     * GET  /friends-list/{friendsListId}/thread : get or create a 1-on-1 thread.
     */
    @GetMapping("/friends-list/{friendsListId}/thread")
    public ResponseEntity<MessageThread> getOrCreateThreadForFriends(@PathVariable Long friendsListId) {
        MessageThread thread = messageThreadService.getOrCreateThreadForFriends(friendsListId);
        return ResponseEntity.ok(thread);
    }
}
