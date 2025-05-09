package bham.team.web.rest.vm;

import bham.team.domain.FriendsList;
import bham.team.domain.Profile;
import bham.team.domain.User;
import bham.team.domain.enumeration.Decision;
import bham.team.repository.FriendsListRepository;
import bham.team.repository.ProfileRepository;
import bham.team.repository.UserRepository;
import bham.team.service.FriendsListService;
import bham.team.web.rest.errors.BadRequestAlertException;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing user friends operations.
 */
@RestController
@RequestMapping("/api/user-friends")
public class UserFriendsResource {

    private final Logger log = LoggerFactory.getLogger(UserFriendsResource.class);

    private final FriendsListService friendsListService;
    private final ProfileRepository profileRepository;
    private final FriendsListRepository friendsListRepository;
    private final UserRepository userRepository;

    public UserFriendsResource(
        FriendsListService friendsListService,
        ProfileRepository profileRepository,
        FriendsListRepository friendsListRepository,
        UserRepository userRepository
    ) {
        this.friendsListService = friendsListService;
        this.profileRepository = profileRepository;
        this.friendsListRepository = friendsListRepository;
        this.userRepository = userRepository;
    }

    /**
     * {@code POST  /send-request/:fromProfileId/:toProfileId} : Send a friend request from one profile to another.
     * If there's a DECLINED relationship, it will be updated to PENDING.
     *
     * @param fromProfileId the ID of the profile sending the request.
     * @param toProfileId the ID of the profile to send the request to.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new friendsList,
     *         or status {@code 200 (OK)} if a relationship already exists.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/send-request/{fromProfileId}/{toProfileId}")
    @Transactional
    public ResponseEntity<FriendsList> sendFriendRequest(@PathVariable Long fromProfileId, @PathVariable Long toProfileId)
        throws URISyntaxException {
        log.debug("REST request to send friend request from profile ID: {} to profile ID: {}", fromProfileId, toProfileId);

        try {
            // Get sender profile
            Profile senderProfile = profileRepository
                .findById(fromProfileId)
                .orElseThrow(() -> new BadRequestAlertException("Sender profile not found", "friendsList", "sendernotfound"));

            // Get recipient profile
            Profile recipientProfile = profileRepository
                .findById(toProfileId)
                .orElseThrow(() -> new BadRequestAlertException("Recipient profile not found", "friendsList", "recipientnotfound"));

            // Check if user is trying to send request to themselves
            if (fromProfileId.equals(toProfileId)) {
                log.error("User attempted to send friend request to themselves");
                throw new BadRequestAlertException("Cannot send friend request to yourself", "friendsList", "selfrequest");
            }

            // Check if a relationship already exists
            Optional<FriendsList> existingRequest = friendsListRepository.findExistingFriendRequest(senderProfile, recipientProfile);

            if (existingRequest.isPresent()) {
                FriendsList friendship = existingRequest.get();

                // If it's DECLINED, update to PENDING
                if (Decision.DECLINED.equals(friendship.getRequestStatus())) {
                    log.debug("Found DECLINED relationship (ID: {}), updating to PENDING", friendship.getId());
                    friendship.setRequestStatus(Decision.PENDING);
                    friendship.setRequestTime(Instant.now());
                    // Always set requestor as the sender profile
                    friendship.setRequestedByProfile(senderProfile);
                    friendship.setRequestedToProfile(recipientProfile);
                    FriendsList updatedFriendship = friendsListRepository.save(friendship);
                    return ResponseEntity.ok(updatedFriendship);
                }

                log.debug("Friend request already exists between these profiles");
                return ResponseEntity.ok(friendship);
            }

            // Create new friend request
            FriendsList friendsList = new FriendsList();
            friendsList.setRequestedByProfile(senderProfile);
            friendsList.setRequestedToProfile(recipientProfile);
            friendsList.setRequestTime(Instant.now());
            friendsList.setRequestStatus(Decision.PENDING);
            friendsList.setFriendSince(Instant.now()); // Set to current time to satisfy @NotNull constraint

            // Save the friend request
            FriendsList result = friendsListRepository.save(friendsList);
            log.debug("Friend request created with ID: {}", result.getId());

            return ResponseEntity.created(new URI("/api/friends-lists/" + result.getId())).body(result);
        } catch (Exception e) {
            log.error("Error in sendFriendRequest: {}", e.getMessage(), e);
            if (e instanceof BadRequestAlertException) {
                throw e;
            }
            throw new BadRequestAlertException("Error processing friend request: " + e.getMessage(), "friendsList", "processingerror");
        }
    }

    /**
     * {@code PUT  /respond/:id/:respondingProfileId} : Respond to a friend request or update existing friendship status.
     * Supports updating to DECLINED for unfollowing without deleting the record.
     *
     * @param id the id of the friendsList to respond to.
     * @param respondingProfileId the ID of the profile responding to the request.
     * @param decision the decision (ACCEPT, DECLINED, or PENDING).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated friendsList.
     */
    @PutMapping("/respond/{id}/{respondingProfileId}")
    @Transactional
    public ResponseEntity<FriendsList> respondToFriendRequest(
        @PathVariable Long id,
        @PathVariable Long respondingProfileId,
        @RequestParam Decision decision
    ) {
        log.debug("REST request to respond to friend request ID {} with decision {} by profile {}", id, decision, respondingProfileId);

        // Get responding profile
        Profile respondingProfile = profileRepository
            .findById(respondingProfileId)
            .orElseThrow(() -> new BadRequestAlertException("Responding profile not found", "friendsList", "profilenotfound"));

        // Get the friend request
        FriendsList friendsList = friendsListRepository
            .findById(id)
            .orElseThrow(() -> new BadRequestAlertException("Friend request not found", "friendsList", "idnotfound"));

        // Verify that the responding profile is either the sender or recipient of this request
        boolean isRecipient = respondingProfile.getId().equals(friendsList.getRequestedToProfile().getId());
        boolean isSender = respondingProfile.getId().equals(friendsList.getRequestedByProfile().getId());

        if (!isRecipient && !isSender) {
            log.error("Responding profile is neither the sender nor recipient of this friend request");
            throw new BadRequestAlertException("Not authorized to respond to this friend request", "friendsList", "notauthorized");
        }

        // Update the friendship status
        log.debug("Updating friendship status from {} to {}", friendsList.getRequestStatus(), decision);
        friendsList.setRequestStatus(decision);

        // If accepting, update the friendSince timestamp
        if (Decision.ACCEPT.equals(decision)) {
            friendsList.setFriendSince(Instant.now());
        }

        // Save the updated friendship
        FriendsList result = friendsListRepository.save(friendsList);
        log.debug("Friend request updated with ID: {} to status: {}", result.getId(), result.getRequestStatus());

        return ResponseEntity.ok().body(result);
    }

    /**
     * {@code GET  /accepted/:profileId} : Get all accepted friends for a profile.
     *
     * @param profileId the ID of the profile to get accepted friends for.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of friendsLists in body.
     */
    @GetMapping("/accepted/{profileId}")
    public ResponseEntity<List<FriendsList>> getAcceptedFriends(@PathVariable Long profileId) {
        log.debug("REST request to get accepted friends for profile ID: {}", profileId);

        // Check if profile exists
        Profile profile = profileRepository
            .findById(profileId)
            .orElseThrow(() -> new BadRequestAlertException("Profile not found", "friendsList", "profilenotfound"));

        List<FriendsList> friendsLists = friendsListService.getAcceptedFriendsByProfileId(profileId);
        return ResponseEntity.ok().body(friendsLists);
    }

    /**
     * {@code GET  /pending/:profileId} : Get all pending friend requests for a profile.
     *
     * @param profileId the ID of the profile to get pending requests for.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of friendsLists in body.
     */
    @GetMapping("/pending/{profileId}")
    public ResponseEntity<List<FriendsList>> getPendingFriendRequests(@PathVariable Long profileId) {
        log.debug("REST request to get pending friend requests for profile ID: {}", profileId);

        // Check if profile exists
        Profile profile = profileRepository
            .findById(profileId)
            .orElseThrow(() -> new BadRequestAlertException("Profile not found", "friendsList", "profilenotfound"));

        List<FriendsList> friendsLists = friendsListService.getPendingFriendRequestsByProfileId(profileId);
        return ResponseEntity.ok().body(friendsLists);
    }

    /**
     * {@code GET  /sent/:profileId} : Get all friend requests sent by a profile.
     *
     * @param profileId the ID of the profile to get sent requests for.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of friendsLists in body.
     */
    @GetMapping("/sent/{profileId}")
    public ResponseEntity<List<FriendsList>> getSentFriendRequests(@PathVariable Long profileId) {
        log.debug("REST request to get sent friend requests for profile ID: {}", profileId);

        // Check if profile exists
        Profile profile = profileRepository
            .findById(profileId)
            .orElseThrow(() -> new BadRequestAlertException("Profile not found", "friendsList", "profilenotfound"));

        List<FriendsList> friendsLists = friendsListService.getSentFriendRequestsByProfileId(profileId);
        return ResponseEntity.ok().body(friendsLists);
    }

    /**
     * {@code GET  /check-status/:profileId1/:profileId2} : Check friendship status between two profiles.
     *
     * @param profileId1 the ID of the first profile.
     * @param profileId2 the ID of the second profile.
     * @return map containing status and friendsListId if applicable.
     */
    @GetMapping("/check-status/{profileId1}/{profileId2}")
    public ResponseEntity<Map<String, Object>> checkFriendshipStatus(@PathVariable Long profileId1, @PathVariable Long profileId2) {
        log.debug("REST request to check friendship status between profiles: {} and {}", profileId1, profileId2);

        Map<String, Object> result = new HashMap<>();

        // Get profiles
        Profile profile1;
        Profile profile2;

        try {
            profile1 = profileRepository
                .findById(profileId1)
                .orElseThrow(() -> new RuntimeException("Profile not found with ID: " + profileId1));
        } catch (Exception e) {
            log.warn("Profile not found with ID: {}", profileId1);
            result.put("status", "NOT_FRIENDS");
            return ResponseEntity.ok().body(result);
        }

        try {
            profile2 = profileRepository
                .findById(profileId2)
                .orElseThrow(() -> new RuntimeException("Profile not found with ID: " + profileId2));
        } catch (Exception e) {
            log.warn("Profile not found with ID: {}", profileId2);
            result.put("status", "NOT_FRIENDS");
            return ResponseEntity.ok().body(result);
        }

        // Check if this is the same profile
        if (profileId1.equals(profileId2)) {
            result.put("status", "SELF");
            return ResponseEntity.ok().body(result);
        }

        // Check if a friend request exists between the profiles
        Optional<FriendsList> existingRequest = friendsListRepository.findExistingFriendRequest(profile1, profile2);

        if (existingRequest.isPresent()) {
            FriendsList request = existingRequest.get();
            log.debug("Found existing relationship with status: {}", request.getRequestStatus());

            if (Decision.ACCEPT.equals(request.getRequestStatus())) {
                result.put("status", "ACCEPTED");
            } else if (Decision.PENDING.equals(request.getRequestStatus())) {
                // Check which profile sent the request
                if (request.getRequestedByProfile().getId().equals(profileId1)) {
                    result.put("status", "PENDING_SENT");
                } else {
                    result.put("status", "PENDING_RECEIVED");
                }
            } else if (Decision.DECLINED.equals(request.getRequestStatus())) {
                result.put("status", "DECLINED");
            } else {
                result.put("status", "NOT_FRIENDS");
            }

            result.put("friendsListId", request.getId());
        } else {
            result.put("status", "NOT_FRIENDS");
        }

        return ResponseEntity.ok().body(result);
    }

    /**
     * {@code GET  /check-relationship/:profileId1/:profileId2} : Check if a friendship relationship exists.
     *
     * @param profileId1 the ID of the first profile.
     * @param profileId2 the ID of the second profile.
     * @return map with relationship details.
     */
    @GetMapping("/check-relationship/{profileId1}/{profileId2}")
    public ResponseEntity<Map<String, Object>> checkRelationship(@PathVariable Long profileId1, @PathVariable Long profileId2) {
        log.debug("REST request to check relationship between profiles: {} and {}", profileId1, profileId2);

        Map<String, Object> result = new HashMap<>();

        // Get profiles
        Profile profile1;
        Profile profile2;

        try {
            profile1 = profileRepository
                .findById(profileId1)
                .orElseThrow(() -> new BadRequestAlertException("First profile not found", "friendsList", "profile1notfound"));
        } catch (BadRequestAlertException e) {
            result.put("status", "error");
            result.put("message", e.getMessage());
            return ResponseEntity.ok(result);
        }

        try {
            profile2 = profileRepository
                .findById(profileId2)
                .orElseThrow(() -> new BadRequestAlertException("Second profile not found", "friendsList", "profile2notfound"));
        } catch (BadRequestAlertException e) {
            result.put("status", "error");
            result.put("message", e.getMessage());
            return ResponseEntity.ok(result);
        }

        // Check if a relationship already exists
        Optional<FriendsList> existingRequest = friendsListRepository.findExistingFriendRequest(profile1, profile2);

        if (existingRequest.isPresent()) {
            FriendsList relationship = existingRequest.get();
            result.put("status", "exists");
            result.put("relationshipId", relationship.getId());
            result.put("requestStatus", relationship.getRequestStatus());
            result.put("sentByProfile1", relationship.getRequestedByProfile().getId().equals(profile1.getId()));
        } else {
            result.put("status", "not_exists");
        }

        return ResponseEntity.ok(result);
    }

    /**
     * {@code GET /followed-profiles/:profileId} : Get profiles that the specified profile is following.
     *
     * @param profileId the ID of the profile to get followed profiles for.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of profiles in body.
     */
    @GetMapping("/followed-profiles/{profileId}")
    public ResponseEntity<List<Profile>> getFollowedProfiles(@PathVariable Long profileId) {
        log.debug("REST request to get profiles followed by profile ID: {}", profileId);

        // Check if profile exists
        Profile profile = profileRepository
            .findById(profileId)
            .orElseThrow(() -> new BadRequestAlertException("Profile not found", "friendsList", "profilenotfound"));

        // Get accepted friends lists
        List<FriendsList> acceptedFriendships = friendsListService.getAcceptedFriendsByProfileId(profileId);

        // Extract profiles the user is following
        List<Profile> followedProfiles = new ArrayList<>();

        for (FriendsList friendship : acceptedFriendships) {
            if (friendship.getRequestedByProfile().getId().equals(profileId)) {
                // User sent the request, so they're following requestedToProfile
                followedProfiles.add(friendship.getRequestedToProfile());
            } else if (friendship.getRequestedToProfile().getId().equals(profileId)) {
                // User received and accepted the request, so they're following requestedByProfile
                followedProfiles.add(friendship.getRequestedByProfile());
            }
        }

        return ResponseEntity.ok().body(followedProfiles);
    }
}
