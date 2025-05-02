package bham.team.web.rest;

import bham.team.domain.MessageThread;
import bham.team.repository.MessageThreadRepository;
import bham.team.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
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
 * REST controller for managing {@link bham.team.domain.MessageThread}.
 */
@RestController
@RequestMapping("/api/message-threads")
@Transactional
public class MessageThreadResource {

    private static final Logger LOG = LoggerFactory.getLogger(MessageThreadResource.class);

    private static final String ENTITY_NAME = "messageThread";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final MessageThreadRepository messageThreadRepository;

    public MessageThreadResource(MessageThreadRepository messageThreadRepository) {
        this.messageThreadRepository = messageThreadRepository;
    }

    /**
     * {@code POST  /message-threads} : Create a new messageThread.
     *
     * @param messageThread the messageThread to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new messageThread, or with status {@code 400 (Bad Request)} if the messageThread has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<MessageThread> createMessageThread(@Valid @RequestBody MessageThread messageThread) throws URISyntaxException {
        LOG.debug("REST request to save MessageThread : {}", messageThread);
        if (messageThread.getId() != null) {
            throw new BadRequestAlertException("A new messageThread cannot already have an ID", ENTITY_NAME, "idexists");
        }
        messageThread = messageThreadRepository.save(messageThread);
        return ResponseEntity.created(new URI("/api/message-threads/" + messageThread.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, messageThread.getId().toString()))
            .body(messageThread);
    }

    /**
     * {@code PUT  /message-threads/:id} : Updates an existing messageThread.
     *
     * @param id the id of the messageThread to save.
     * @param messageThread the messageThread to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated messageThread,
     * or with status {@code 400 (Bad Request)} if the messageThread is not valid,
     * or with status {@code 500 (Internal Server Error)} if the messageThread couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<MessageThread> updateMessageThread(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody MessageThread messageThread
    ) throws URISyntaxException {
        LOG.debug("REST request to update MessageThread : {}, {}", id, messageThread);
        if (messageThread.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, messageThread.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!messageThreadRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        messageThread = messageThreadRepository.save(messageThread);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, messageThread.getId().toString()))
            .body(messageThread);
    }

    /**
     * {@code PATCH  /message-threads/:id} : Partial updates given fields of an existing messageThread, field will ignore if it is null
     *
     * @param id the id of the messageThread to save.
     * @param messageThread the messageThread to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated messageThread,
     * or with status {@code 400 (Bad Request)} if the messageThread is not valid,
     * or with status {@code 404 (Not Found)} if the messageThread is not found,
     * or with status {@code 500 (Internal Server Error)} if the messageThread couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<MessageThread> partialUpdateMessageThread(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody MessageThread messageThread
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update MessageThread partially : {}, {}", id, messageThread);
        if (messageThread.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, messageThread.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!messageThreadRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<MessageThread> result = messageThreadRepository
            .findById(messageThread.getId())
            .map(existingMessageThread -> {
                if (messageThread.getIsGroup() != null) {
                    existingMessageThread.setIsGroup(messageThread.getIsGroup());
                }
                if (messageThread.getName() != null) {
                    existingMessageThread.setName(messageThread.getName());
                }
                if (messageThread.getCreatedOn() != null) {
                    existingMessageThread.setCreatedOn(messageThread.getCreatedOn());
                }
                if (messageThread.getUpdatedOn() != null) {
                    existingMessageThread.setUpdatedOn(messageThread.getUpdatedOn());
                }

                return existingMessageThread;
            })
            .map(messageThreadRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, messageThread.getId().toString())
        );
    }

    /**
     * {@code GET  /message-threads} : get all the messageThreads.
     *
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of messageThreads in body.
     */
    @GetMapping("")
    public List<MessageThread> getAllMessageThreads(
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get all MessageThreads");
        if (eagerload) {
            return messageThreadRepository.findAllWithEagerRelationships();
        } else {
            return messageThreadRepository.findAll();
        }
    }

    /**
     * {@code GET  /message-threads/:id} : get the "id" messageThread.
     *
     * @param id the id of the messageThread to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the messageThread, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<MessageThread> getMessageThread(@PathVariable("id") Long id) {
        LOG.debug("REST request to get MessageThread : {}", id);
        Optional<MessageThread> messageThread = messageThreadRepository.findOneWithEagerRelationships(id);
        return ResponseUtil.wrapOrNotFound(messageThread);
    }

    /**
     * {@code DELETE  /message-threads/:id} : delete the "id" messageThread.
     *
     * @param id the id of the messageThread to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessageThread(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete MessageThread : {}", id);
        messageThreadRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
