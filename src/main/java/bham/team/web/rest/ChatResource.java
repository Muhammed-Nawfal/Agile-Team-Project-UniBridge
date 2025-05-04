package bham.team.web.rest;

import bham.team.domain.Chat;
import bham.team.domain.MessageThread;
import bham.team.domain.Profile;
import bham.team.domain.enumeration.MessageStatus;
import bham.team.repository.ChatRepository;
import bham.team.repository.MessageThreadRepository;
import bham.team.repository.ProfileRepository;
import bham.team.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.security.Principal;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link bham.team.domain.Chat}.
 */
@RestController
@RequestMapping("/api/chats")
@Transactional
public class ChatResource {

    private final Logger log = LoggerFactory.getLogger(ChatResource.class);
    private static final String ENTITY_NAME = "chat";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ChatRepository chatRepository;
    private final MessageThreadRepository messageThreadRepository;
    private final ProfileRepository profileRepository;

    public ChatResource(
        ChatRepository chatRepository,
        MessageThreadRepository messageThreadRepository,
        ProfileRepository profileRepository
    ) {
        this.chatRepository = chatRepository;
        this.messageThreadRepository = messageThreadRepository;
        this.profileRepository = profileRepository;
    }

    @PostMapping("")
    public ResponseEntity<Chat> createChat(@Valid @RequestBody Chat chat) throws URISyntaxException {
        log.debug("REST request to save Chat : {}", chat);
        if (chat.getId() != null) {
            throw new BadRequestAlertException("A new chat cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Chat result = chatRepository.save(chat);
        return ResponseEntity.created(new URI("/api/chats/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @GetMapping("/by-thread/{threadId}")
    public ResponseEntity<List<Chat>> getChatsByThread(@PathVariable Long threadId) {
        log.debug("REST request to get Chats by thread : {}", threadId);
        List<Chat> chats = chatRepository.findByMessageThreadIdOrderByTimestampAsc(threadId);
        return ResponseEntity.ok().body(chats);
    }

    @PostMapping("/thread/{threadId}")
    public ResponseEntity<Chat> createChatInThread(@PathVariable Long threadId, @Valid @RequestBody Chat chat, Principal principal)
        throws URISyntaxException {
        log.debug("REST request to save Chat in thread {} : {}", threadId, chat);
        if (chat.getId() != null) {
            throw new BadRequestAlertException("A new chat cannot already have an ID", ENTITY_NAME, "idexists");
        }

        // 1) Load and validate the thread
        MessageThread thread = messageThreadRepository
            .findById(threadId)
            .orElseThrow(() -> new BadRequestAlertException("Invalid thread ID", ENTITY_NAME, "threadnotfound"));

        // 2) Resolve sender profile from the authenticated principal
        Profile sender = profileRepository
            .findByUserLogin(principal.getName())
            .orElseThrow(() -> new BadRequestAlertException("Profile not found", ENTITY_NAME, "profilenotfound"));

        // 3) If not a group thread, determine the other (receiver) participant
        Profile receiver = null;
        if (!thread.getIsGroup()) {
            receiver = thread
                .getParticipants()
                .stream()
                .filter(p -> !p.getId().equals(sender.getId()))
                .findFirst()
                .orElseThrow(() -> new BadRequestAlertException("Receiver not found", ENTITY_NAME, "receivernotfound"));
        }

        // 4) Populate Chat fields and save
        chat.setMessageThread(thread);
        chat.setSender(sender);
        chat.setReceiver(receiver);
        chat.setTimestamp(Instant.now());
        chat.setCreatedOn(Instant.now());
        chat.setStatus(MessageStatus.SENT);
        if (chat.getIsDeleted() == null) {
            chat.setIsDeleted(false);
        }

        // 5) Update thread timestamp & persist
        thread.setUpdatedOn(Instant.now());
        messageThreadRepository.save(thread);

        Chat result = chatRepository.save(chat);
        return ResponseEntity.created(new URI("/api/chats/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @PostMapping("/thread/{threadId}/mark-read")
    public ResponseEntity<Void> markMessagesAsRead(@PathVariable Long threadId, Principal principal) {
        log.debug("REST request to mark messages as read in thread : {}", threadId);

        // Resolve the profile of the authenticated user
        Profile currentUser = profileRepository
            .findByUserLogin(principal.getName())
            .orElseThrow(() -> new BadRequestAlertException("Profile not found", ENTITY_NAME, "profilenotfound"));

        // Find and mark unread messages as READ
        List<Chat> unread = chatRepository.findByMessageThreadIdAndReceiverIdAndStatusNot(
            threadId,
            currentUser.getId(),
            MessageStatus.READ
        );
        unread.forEach(c -> {
            c.setStatus(MessageStatus.READ);
            chatRepository.save(c);
        });

        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Chat> updateChat(@PathVariable(value = "id", required = false) final Long id, @Valid @RequestBody Chat chat)
        throws URISyntaxException {
        log.debug("REST request to update Chat : {}, {}", id, chat);
        if (chat.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, chat.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }
        if (!chatRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }
        Chat result = chatRepository.save(chat);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, chat.getId().toString()))
            .body(result);
    }

    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Chat> partialUpdateChat(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Chat chat
    ) throws URISyntaxException {
        log.debug("REST request to partial update Chat : {}, {}", id, chat);
        if (chat.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, chat.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }
        if (!chatRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Chat> result = chatRepository
            .findById(chat.getId())
            .map(existing -> {
                if (chat.getMessage() != null) existing.setMessage(chat.getMessage());
                if (chat.getTimestamp() != null) existing.setTimestamp(chat.getTimestamp());
                if (chat.getStatus() != null) existing.setStatus(chat.getStatus());
                if (chat.getType() != null) existing.setType(chat.getType());
                if (chat.getMedia() != null) existing.setMedia(chat.getMedia());
                if (chat.getMediaContentType() != null) existing.setMediaContentType(chat.getMediaContentType());
                if (chat.getIsDeleted() != null) existing.setIsDeleted(chat.getIsDeleted());
                if (chat.getCreatedOn() != null) existing.setCreatedOn(chat.getCreatedOn());
                if (chat.getUpdatedOn() != null) existing.setUpdatedOn(chat.getUpdatedOn());
                return existing;
            })
            .map(chatRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, chat.getId().toString())
        );
    }

    @GetMapping("")
    public List<Chat> getAllChats() {
        log.debug("REST request to get all Chats");
        return chatRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Chat> getChat(@PathVariable Long id) {
        log.debug("REST request to get Chat : {}", id);
        Optional<Chat> chat = chatRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(chat);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChat(@PathVariable Long id) {
        log.debug("REST request to delete Chat : {}", id);
        chatRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
