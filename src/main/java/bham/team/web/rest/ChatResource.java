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
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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

    private static final Logger LOG = LoggerFactory.getLogger(ChatResource.class);

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

    /**
     * {@code POST  /chats} : Create a new chat.
     *
     * @param chat the chat to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new chat, or with status {@code 400 (Bad Request)} if the chat has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<Chat> createChat(@Valid @RequestBody Chat chat) throws URISyntaxException {
        LOG.debug("REST request to save Chat : {}", chat);
        if (chat.getId() != null) {
            throw new BadRequestAlertException("A new chat cannot already have an ID", ENTITY_NAME, "idexists");
        }
        chat = chatRepository.save(chat);
        return ResponseEntity.created(new URI("/api/chats/" + chat.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, chat.getId().toString()))
            .body(chat);
    }

    /**
     * {@code GET  /chats/by-thread/:threadId} : get all chats by thread ID.
     *
     * @param threadId the id of the thread
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of chats in body.
     */
    @GetMapping("/by-thread/{threadId}")
    public ResponseEntity<List<Chat>> getChatsByThread(@PathVariable Long threadId) {
        LOG.debug("REST request to get Chats by thread : {}", threadId);
        List<Chat> chats = chatRepository.findByMessageThreadIdOrderByTimestampAsc(threadId);
        return ResponseEntity.ok().body(chats);
    }

    /**
     * {@code POST  /chats/thread/:threadId} : Create a new chat in a specific thread.
     *
     * @param threadId the id of the thread
     * @param chat the chat to create
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new chat.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/thread/{threadId}")
    public ResponseEntity<Chat> createChatInThread(
        @PathVariable Long threadId,
        @Valid @RequestBody Chat chat,
        @AuthenticationPrincipal UserDetails userDetails
    ) throws URISyntaxException {
        LOG.debug("REST request to save Chat in thread {} : {}", threadId, chat);

        if (chat.getId() != null) {
            throw new BadRequestAlertException("A new chat cannot already have an ID", ENTITY_NAME, "idexists");
        }

        // Find the thread
        MessageThread thread = messageThreadRepository
            .findById(threadId)
            .orElseThrow(() -> new BadRequestAlertException("Invalid thread ID", ENTITY_NAME, "threadnotfound"));

        // Find the sender profile based on the authenticated user
        Profile sender = profileRepository
            .findByUserLogin(userDetails.getUsername())
            .orElseThrow(() -> new BadRequestAlertException("Profile not found", ENTITY_NAME, "profilenotfound"));

        // Determine the receiver based on the thread participants
        Profile receiver = null;
        if (!thread.getIsGroup()) {
            // For 1-on-1 chat, find the other participant
            receiver = thread
                .getParticipants()
                .stream()
                .filter(p -> !p.getId().equals(sender.getId()))
                .findFirst()
                .orElseThrow(() -> new BadRequestAlertException("Receiver not found", ENTITY_NAME, "receivernotfound"));
        }

        // Set chat properties
        chat.setMessageThread(thread);
        chat.setSender(sender);
        chat.setReceiver(receiver);
        chat.setTimestamp(Instant.now());
        chat.setCreatedOn(Instant.now());
        chat.setStatus(MessageStatus.SENT);
        if (chat.getIsDeleted() == null) {
            chat.setIsDeleted(false);
        }

        // Update thread's updatedOn timestamp
        thread.setUpdatedOn(Instant.now());
        messageThreadRepository.save(thread);

        Chat result = chatRepository.save(chat);
        return ResponseEntity.created(new URI("/api/chats/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code POST  /chats/thread/:threadId/mark-read} : Mark all messages as read in a thread.
     *
     * @param threadId the id of the thread
     * @return the {@link ResponseEntity} with status {@code 200 (OK)}.
     */
    @PostMapping("/thread/{threadId}/mark-read")
    public ResponseEntity<Void> markMessagesAsRead(@PathVariable Long threadId, @AuthenticationPrincipal UserDetails userDetails) {
        LOG.debug("REST request to mark messages as read in thread : {}", threadId);

        // Find the current user's profile
        Profile currentUser = profileRepository
            .findByUserLogin(userDetails.getUsername())
            .orElseThrow(() -> new BadRequestAlertException("Profile not found", ENTITY_NAME, "profilenotfound"));

        // Find all unread messages where the current user is the receiver
        List<Chat> unreadMessages = chatRepository.findByMessageThreadIdAndReceiverIdAndStatusNot(
            threadId,
            currentUser.getId(),
            MessageStatus.READ
        );

        // Mark all messages as read
        unreadMessages.forEach(chat -> {
            chat.setStatus(MessageStatus.READ);
            chatRepository.save(chat);
        });

        return ResponseEntity.ok().build();
    }

    /**
     * {@code PUT  /chats/:id} : Updates an existing chat.
     *
     * @param id the id of the chat to save.
     * @param chat the chat to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated chat,
     * or with status {@code 400 (Bad Request)} if the chat is not valid,
     * or with status {@code 500 (Internal Server Error)} if the chat couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Chat> updateChat(@PathVariable(value = "id", required = false) final Long id, @Valid @RequestBody Chat chat)
        throws URISyntaxException {
        LOG.debug("REST request to update Chat : {}, {}", id, chat);
        if (chat.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, chat.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!chatRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        chat = chatRepository.save(chat);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, chat.getId().toString()))
            .body(chat);
    }

    /**
     * {@code PATCH  /chats/:id} : Partial updates given fields of an existing chat, field will ignore if it is null
     *
     * @param id the id of the chat to save.
     * @param chat the chat to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated chat,
     * or with status {@code 400 (Bad Request)} if the chat is not valid,
     * or with status {@code 404 (Not Found)} if the chat is not found,
     * or with status {@code 500 (Internal Server Error)} if the chat couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Chat> partialUpdateChat(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Chat chat
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Chat partially : {}, {}", id, chat);
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
            .map(existingChat -> {
                if (chat.getMessage() != null) {
                    existingChat.setMessage(chat.getMessage());
                }
                if (chat.getTimestamp() != null) {
                    existingChat.setTimestamp(chat.getTimestamp());
                }
                if (chat.getStatus() != null) {
                    existingChat.setStatus(chat.getStatus());
                }
                if (chat.getType() != null) {
                    existingChat.setType(chat.getType());
                }
                if (chat.getMedia() != null) {
                    existingChat.setMedia(chat.getMedia());
                }
                if (chat.getMediaContentType() != null) {
                    existingChat.setMediaContentType(chat.getMediaContentType());
                }
                if (chat.getIsDeleted() != null) {
                    existingChat.setIsDeleted(chat.getIsDeleted());
                }
                if (chat.getCreatedOn() != null) {
                    existingChat.setCreatedOn(chat.getCreatedOn());
                }
                if (chat.getUpdatedOn() != null) {
                    existingChat.setUpdatedOn(chat.getUpdatedOn());
                }

                return existingChat;
            })
            .map(chatRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, chat.getId().toString())
        );
    }

    /**
     * {@code GET  /chats} : get all the chats.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of chats in body.
     */
    @GetMapping("")
    public List<Chat> getAllChats() {
        LOG.debug("REST request to get all Chats");
        return chatRepository.findAll();
    }

    /**
     * {@code GET  /chats/:id} : get the "id" chat.
     *
     * @param id the id of the chat to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the chat, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Chat> getChat(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Chat : {}", id);
        Optional<Chat> chat = chatRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(chat);
    }

    /**
     * {@code DELETE  /chats/:id} : delete the "id" chat.
     *
     * @param id the id of the chat to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChat(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Chat : {}", id);
        chatRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
