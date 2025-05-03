package bham.team.web.rest;

import bham.team.domain.FriendsList;
import bham.team.domain.enumeration.Decision;
import bham.team.repository.FriendsListRepository;
import bham.team.service.FriendsListService;
import bham.team.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.StreamSupport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link bham.team.domain.FriendsList}.
 */
@RestController
@RequestMapping("/api/friends-lists")
@Transactional
public class FriendsListResource {

    private static final Logger LOG = LoggerFactory.getLogger(FriendsListResource.class);

    private static final String ENTITY_NAME = "friendsList";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final FriendsListRepository friendsListRepository;
    private final FriendsListService friendsListService;

    public FriendsListResource(FriendsListRepository friendsListRepository, FriendsListService friendsListService) {
        this.friendsListRepository = friendsListRepository;
        this.friendsListService = friendsListService;
    }

    /**
     * {@code POST  /friends-lists} : Create a new friendsList.
     *
     * @param friendsList the friendsList to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new friendsList, or with status {@code 400 (Bad Request)} if the friendsList has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<FriendsList> createFriendsList(@Valid @RequestBody FriendsList friendsList) throws URISyntaxException {
        LOG.debug("REST request to save FriendsList : {}", friendsList);
        if (friendsList.getId() != null) {
            throw new BadRequestAlertException("A new friendsList cannot already have an ID", ENTITY_NAME, "idexists");
        }
        friendsList = friendsListRepository.save(friendsList);
        return ResponseEntity.created(new URI("/api/friends-lists/" + friendsList.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, friendsList.getId().toString()))
            .body(friendsList);
    }

    /**
     * {@code POST  /friends-lists/send-request} : Send a friend request.
     *
     * @param requestorProfileId the ID of the profile sending the request.
     * @param requestedProfileId the ID of the profile to whom the request is sent.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new friendsList.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/send-request")
    public ResponseEntity<FriendsList> sendFriendRequest(@RequestParam Long requestorProfileId, @RequestParam Long requestedProfileId)
        throws URISyntaxException {
        LOG.debug("REST request to send friend request from profile {} to profile {}", requestorProfileId, requestedProfileId);

        FriendsList friendsList = friendsListService.sendFriendRequest(requestorProfileId, requestedProfileId);

        return ResponseEntity.created(new URI("/api/friends-lists/" + friendsList.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, friendsList.getId().toString()))
            .body(friendsList);
    }

    /**
     * {@code PUT  /friends-lists/respond/{id}} : Respond to a friend request.
     *
     * @param id the id of the friendsList to respond to.
     * @param decision the decision (ACCEPT or DECLINED).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated friendsList.
     */
    @PutMapping("/respond/{id}")
    public ResponseEntity<FriendsList> respondToFriendRequest(@PathVariable Long id, @RequestParam Decision decision) {
        LOG.debug("REST request to respond to friend request ID {} with decision {}", id, decision);

        FriendsList friendsList = friendsListService.respondToFriendRequest(id, decision);

        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, friendsList.getId().toString()))
            .body(friendsList);
    }

    /**
     * {@code PUT  /friends-lists/:id} : Updates an existing friendsList.
     *
     * @param id the id of the friendsList to save.
     * @param friendsList the friendsList to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated friendsList,
     * or with status {@code 400 (Bad Request)} if the friendsList is not valid,
     * or with status {@code 500 (Internal Server Error)} if the friendsList couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<FriendsList> updateFriendsList(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody FriendsList friendsList
    ) throws URISyntaxException {
        LOG.debug("REST request to update FriendsList : {}, {}", id, friendsList);
        if (friendsList.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, friendsList.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!friendsListRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        friendsList = friendsListRepository.save(friendsList);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, friendsList.getId().toString()))
            .body(friendsList);
    }

    /**
     * {@code PATCH  /friends-lists/:id} : Partial updates given fields of an existing friendsList, field will ignore if it is null
     *
     * @param id the id of the friendsList to save.
     * @param friendsList the friendsList to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated friendsList,
     * or with status {@code 400 (Bad Request)} if the friendsList is not valid,
     * or with status {@code 404 (Not Found)} if the friendsList is not found,
     * or with status {@code 500 (Internal Server Error)} if the friendsList couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<FriendsList> partialUpdateFriendsList(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody FriendsList friendsList
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update FriendsList partially : {}, {}", id, friendsList);
        if (friendsList.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, friendsList.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!friendsListRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<FriendsList> result = friendsListRepository
            .findById(friendsList.getId())
            .map(existingFriendsList -> {
                if (friendsList.getRequestTime() != null) {
                    existingFriendsList.setRequestTime(friendsList.getRequestTime());
                }
                if (friendsList.getRequestStatus() != null) {
                    existingFriendsList.setRequestStatus(friendsList.getRequestStatus());
                }
                if (friendsList.getFriendSince() != null) {
                    existingFriendsList.setFriendSince(friendsList.getFriendSince());
                }
                if (friendsList.getNickname() != null) {
                    existingFriendsList.setNickname(friendsList.getNickname());
                }

                return existingFriendsList;
            })
            .map(friendsListRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, friendsList.getId().toString())
        );
    }

    /**
     * {@code GET  /friends-lists} : get all the friendsLists.
     *
     * @param filter the filter of the request.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of friendsLists in body.
     */
    @GetMapping("")
    public List<FriendsList> getAllFriendsLists(@RequestParam(name = "filter", required = false) String filter) {
        if ("messagethread-is-null".equals(filter)) {
            LOG.debug("REST request to get all FriendsLists where messageThread is null");
            return StreamSupport.stream(friendsListRepository.findAll().spliterator(), false)
                .filter(friendsList -> friendsList.getMessageThread() == null)
                .toList();
        }
        LOG.debug("REST request to get all FriendsLists");
        return friendsListRepository.findAll();
    }

    /**
     * {@code GET  /friends-lists/profile/:profileId/accepted} : get all accepted friends for a profile.
     *
     * @param profileId the profile ID for which to get accepted friends.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of friendsLists in body.
     */
    @GetMapping("/profile/{profileId}/accepted")
    public ResponseEntity<List<FriendsList>> getAcceptedFriendsByProfileId(@PathVariable Long profileId) {
        LOG.debug("REST request to get accepted friends for profile ID {}", profileId);
        List<FriendsList> friendsLists = friendsListService.getAcceptedFriendsByProfileId(profileId);
        return ResponseEntity.ok().body(friendsLists);
    }

    /**
     * {@code GET  /friends-lists/profile/:profileId/pending} : get all pending friend requests for a profile.
     *
     * @param profileId the profile ID for which to get pending requests.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of friendsLists in body.
     */
    @GetMapping("/profile/{profileId}/pending")
    public ResponseEntity<List<FriendsList>> getPendingFriendRequestsByProfileId(@PathVariable Long profileId) {
        LOG.debug("REST request to get pending friend requests for profile ID {}", profileId);
        List<FriendsList> friendsLists = friendsListService.getPendingFriendRequestsByProfileId(profileId);
        return ResponseEntity.ok().body(friendsLists);
    }

    /**
     * {@code GET  /friends-lists/profile/:profileId/sent} : get all friend requests sent by a profile.
     *
     * @param profileId the profile ID for which to get sent requests.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of friendsLists in body.
     */
    @GetMapping("/profile/{profileId}/sent")
    public ResponseEntity<List<FriendsList>> getSentFriendRequestsByProfileId(@PathVariable Long profileId) {
        LOG.debug("REST request to get sent friend requests for profile ID {}", profileId);
        List<FriendsList> friendsLists = friendsListService.getSentFriendRequestsByProfileId(profileId);
        return ResponseEntity.ok().body(friendsLists);
    }

    /**
     * {@code GET  /friends-lists/:id} : get the "id" friendsList.
     *
     * @param id the id of the friendsList to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the friendsList, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<FriendsList> getFriendsList(@PathVariable("id") Long id) {
        LOG.debug("REST request to get FriendsList : {}", id);
        Optional<FriendsList> friendsList = friendsListRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(friendsList);
    }

    /**
     * {@code DELETE  /friends-lists/:id} : delete the "id" friendsList.
     *
     * @param id the id of the friendsList to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFriendsList(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete FriendsList : {}", id);
        friendsListRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
