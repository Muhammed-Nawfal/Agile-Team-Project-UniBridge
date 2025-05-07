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
     * {@code POST  /send-request/:profileId} : Send a friend request from the current user to another profile.
     * If there's a DECLINED relationship, it will be updated to PENDING.
     *
     * @param profileId the ID of the profile to send the request to.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new friendsList,
     *         or status {@code 200 (OK)} if a relationship already exists.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/send-request/{profileId}")
    @Transactional
    public ResponseEntity<FriendsList> sendFriendRequest(@PathVariable Long profileId) throws URISyntaxException {
        log.debug("REST request from current user to send friend request to profile ID: {}", profileId);

        try {
            // Get current username
            String currentUsername = getCurrentUsername();
            if (currentUsername == null) {
                throw new BadRequestAlertException("No authenticated user found", "friendsList", "noauthentication");
            }
            log.debug("Current username: {}", currentUsername);

            // Get current user's profile
            Profile currentUserProfile = profileRepository
                .findByUserLogin(currentUsername)
                .orElseThrow(() -> new BadRequestAlertException("Current user has no profile", "friendsList", "noprofile"));

            log.debug("Found current user profile with ID: {}", currentUserProfile.getId());

            // Check if target profile exists
            Profile targetProfile = profileRepository
                .findById(profileId)
                .orElseThrow(() -> new BadRequestAlertException("Target profile not found", "friendsList", "targetnotfound"));

            // Check if user is trying to send request to themselves
            if (currentUserProfile.getId().equals(profileId)) {
                log.error("User attempted to send friend request to themselves");
                throw new BadRequestAlertException("Cannot send friend request to yourself", "friendsList", "selfrequest");
            }

            // Check if a relationship already exists
            Optional<FriendsList> existingRequest = friendsListRepository.findExistingFriendRequest(currentUserProfile, targetProfile);

            if (existingRequest.isPresent()) {
                FriendsList friendship = existingRequest.get();

                // If it's DECLINED, update to PENDING
                if (Decision.DECLINED.equals(friendship.getRequestStatus())) {
                    log.debug("Found DECLINED relationship (ID: {}), updating to PENDING", friendship.getId());
                    friendship.setRequestStatus(Decision.PENDING);
                    friendship.setRequestTime(Instant.now());
                    // Always set requestor as the current user
                    friendship.setRequestedByProfile(currentUserProfile);
                    friendship.setRequestedToProfile(targetProfile);
                    FriendsList updatedFriendship = friendsListRepository.save(friendship);
                    return ResponseEntity.ok(updatedFriendship);
                }

                log.debug("Friend request already exists between these profiles");
                return ResponseEntity.ok(friendship);
            }

            // Create new friend request
            FriendsList friendsList = new FriendsList();
            friendsList.setRequestedByProfile(currentUserProfile);
            friendsList.setRequestedToProfile(targetProfile);
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
     * {@code PUT  /respond/:id} : Respond to a friend request or update existing friendship status.
     * Supports updating to DECLINED for unfollowing without deleting the record.
     *
     * @param id the id of the friendsList to respond to.
     * @param decision the decision (ACCEPT, DECLINED, or PENDING).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated friendsList.
     */
    @PutMapping("/respond/{id}")
    @Transactional
    public ResponseEntity<FriendsList> respondToFriendRequest(@PathVariable Long id, @RequestParam Decision decision) {
        log.debug("REST request to respond to friend request ID {} with decision {}", id, decision);

        // Get current username
        String currentUsername = getCurrentUsername();
        if (currentUsername == null) {
            throw new BadRequestAlertException("No authenticated user found", "friendsList", "noauthentication");
        }

        // Get current user's profile
        Profile currentUserProfile = profileRepository
            .findByUserLogin(currentUsername)
            .orElseThrow(() -> new BadRequestAlertException("Current user has no profile", "friendsList", "noprofile"));

        // Get the friend request
        FriendsList friendsList = friendsListRepository
            .findById(id)
            .orElseThrow(() -> new BadRequestAlertException("Friend request not found", "friendsList", "idnotfound"));

        // Verify that the current user is either the sender or recipient of this request
        boolean isRecipient = currentUserProfile.getId().equals(friendsList.getRequestedToProfile().getId());
        boolean isSender = currentUserProfile.getId().equals(friendsList.getRequestedByProfile().getId());

        if (!isRecipient && !isSender) {
            log.error("Current user is neither the sender nor recipient of this friend request");
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
     * {@code GET  /accepted} : Get all accepted friends for the current user.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of friendsLists in body.
     */
    @GetMapping("/accepted")
    public ResponseEntity<List<FriendsList>> getCurrentUserAcceptedFriends() {
        log.debug("REST request to get accepted friends for current user");

        String currentUsername = getCurrentUsername();
        if (currentUsername == null) {
            throw new BadRequestAlertException("No authenticated user found", "friendsList", "noauthentication");
        }

        // Get current user's profile
        Profile currentUserProfile = profileRepository
            .findByUserLogin(currentUsername)
            .orElseThrow(() -> new BadRequestAlertException("Current user has no profile", "friendsList", "noprofile"));

        List<FriendsList> friendsLists = friendsListService.getAcceptedFriendsByProfileId(currentUserProfile.getId());
        return ResponseEntity.ok().body(friendsLists);
    }

    /**
     * {@code GET  /pending} : Get all pending friend requests for the current user.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of friendsLists in body.
     */
    @GetMapping("/pending")
    public ResponseEntity<List<FriendsList>> getCurrentUserPendingFriendRequests() {
        log.debug("REST request to get pending friend requests for current user");

        String currentUsername = getCurrentUsername();
        if (currentUsername == null) {
            throw new BadRequestAlertException("No authenticated user found", "friendsList", "noauthentication");
        }

        // Get current user's profile
        Profile currentUserProfile = profileRepository
            .findByUserLogin(currentUsername)
            .orElseThrow(() -> new BadRequestAlertException("Current user has no profile", "friendsList", "noprofile"));

        List<FriendsList> friendsLists = friendsListService.getPendingFriendRequestsByProfileId(currentUserProfile.getId());
        return ResponseEntity.ok().body(friendsLists);
    }

    /**
     * {@code GET  /sent} : Get all friend requests sent by the current user.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of friendsLists in body.
     */
    @GetMapping("/sent")
    public ResponseEntity<List<FriendsList>> getCurrentUserSentFriendRequests() {
        log.debug("REST request to get sent friend requests for current user");

        String currentUsername = getCurrentUsername();
        if (currentUsername == null) {
            throw new BadRequestAlertException("No authenticated user found", "friendsList", "noauthentication");
        }

        // Get current user's profile
        Profile currentUserProfile = profileRepository
            .findByUserLogin(currentUsername)
            .orElseThrow(() -> new BadRequestAlertException("Current user has no profile", "friendsList", "noprofile"));

        List<FriendsList> friendsLists = friendsListService.getSentFriendRequestsByProfileId(currentUserProfile.getId());
        return ResponseEntity.ok().body(friendsLists);
    }

    /**
     * {@code GET  /check-status/:profileId} : Check friendship status between current user and another profile.
     * Including DECLINED status for the modified unfollow implementation.
     *
     * @param profileId the ID of the profile to check status with.
     * @return map containing status and friendsListId if applicable.
     */
    @GetMapping("/check-status/{profileId}")
    public ResponseEntity<Map<String, Object>> checkFriendshipStatus(@PathVariable Long profileId) {
        log.debug("REST request to check friendship status with profile ID: {}", profileId);

        String currentUsername = getCurrentUsername();
        Map<String, Object> result = new HashMap<>();

        // If not authenticated, return NOT_FRIENDS status
        if (currentUsername == null) {
            log.warn("No authenticated user found when checking friendship status");
            result.put("status", "NOT_FRIENDS");
            return ResponseEntity.ok().body(result);
        }

        // Get current user's profile
        Profile currentUserProfile;
        try {
            currentUserProfile = profileRepository
                .findByUserLogin(currentUsername)
                .orElseThrow(() -> new RuntimeException("Current user has no profile for username: " + currentUsername));
        } catch (Exception e) {
            log.warn("Current user has no profile for username: {}", currentUsername);
            result.put("status", "NOT_FRIENDS");
            return ResponseEntity.ok().body(result);
        }

        // Get target profile
        Profile targetProfile;
        try {
            targetProfile = profileRepository
                .findById(profileId)
                .orElseThrow(() -> new RuntimeException("Target profile not found with ID: " + profileId));
        } catch (Exception e) {
            log.warn("Target profile not found with ID: {}", profileId);
            result.put("status", "NOT_FRIENDS");
            return ResponseEntity.ok().body(result);
        }

        // Check if this is the user's own profile
        if (currentUserProfile.getId().equals(profileId)) {
            result.put("status", "SELF");
            return ResponseEntity.ok().body(result);
        }

        // Check if a friend request exists between the profiles
        Optional<FriendsList> existingRequest = friendsListRepository.findExistingFriendRequest(currentUserProfile, targetProfile);

        if (existingRequest.isPresent()) {
            FriendsList request = existingRequest.get();
            log.debug("Found existing relationship with status: {}", request.getRequestStatus());

            if (Decision.ACCEPT.equals(request.getRequestStatus())) {
                result.put("status", "ACCEPTED");
            } else if (Decision.PENDING.equals(request.getRequestStatus())) {
                // Check if the current user sent or received the request
                if (request.getRequestedByProfile().getId().equals(currentUserProfile.getId())) {
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
     * {@code GET  /check-relationship/:profileId} : Check if a friendship relationship exists.
     *
     * @param profileId the ID of the profile to check relationship with.
     * @return map with relationship details.
     */
    @GetMapping("/check-relationship/{profileId}")
    public ResponseEntity<Map<String, Object>> checkRelationship(@PathVariable Long profileId) {
        log.debug("REST request to check relationship with profile ID: {}", profileId);

        // Get current username
        String currentUsername = getCurrentUsername();
        Map<String, Object> result = new HashMap<>();

        if (currentUsername == null) {
            result.put("status", "error");
            result.put("message", "No authenticated user found");
            return ResponseEntity.ok(result);
        }

        // Get current user's profile
        Profile currentUserProfile;
        try {
            currentUserProfile = profileRepository
                .findByUserLogin(currentUsername)
                .orElseThrow(() -> new BadRequestAlertException("Current user has no profile", "friendsList", "noprofile"));
        } catch (BadRequestAlertException e) {
            result.put("status", "error");
            result.put("message", e.getMessage());
            return ResponseEntity.ok(result);
        }

        // Get target profile
        Profile targetProfile;
        try {
            targetProfile = profileRepository
                .findById(profileId)
                .orElseThrow(() -> new BadRequestAlertException("Target profile not found", "friendsList", "targetnotfound"));
        } catch (BadRequestAlertException e) {
            result.put("status", "error");
            result.put("message", e.getMessage());
            return ResponseEntity.ok(result);
        }

        // Check if a relationship already exists
        Optional<FriendsList> existingRequest = friendsListRepository.findExistingFriendRequest(currentUserProfile, targetProfile);

        if (existingRequest.isPresent()) {
            FriendsList relationship = existingRequest.get();
            result.put("status", "exists");
            result.put("relationshipId", relationship.getId());
            result.put("requestStatus", relationship.getRequestStatus());
            result.put("sentByCurrentUser", relationship.getRequestedByProfile().getId().equals(currentUserProfile.getId()));
        } else {
            result.put("status", "not_exists");
        }

        return ResponseEntity.ok(result);
    }

    /**
     * {@code GET /followed-profiles} : Get profiles that the current user is following.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of profiles in body.
     */
    @GetMapping("/followed-profiles")
    public ResponseEntity<List<Profile>> getFollowedProfiles() {
        log.debug("REST request to get profiles the current user follows");

        // Get current username
        String currentUsername = getCurrentUsername();
        if (currentUsername == null) {
            throw new BadRequestAlertException("No authenticated user found", "friendsList", "noauthentication");
        }

        // Get current user's profile
        Profile currentUserProfile = profileRepository
            .findByUserLogin(currentUsername)
            .orElseThrow(() -> new BadRequestAlertException("Current user has no profile", "friendsList", "noprofile"));

        // Get accepted friends lists
        List<FriendsList> acceptedFriendships = friendsListService.getAcceptedFriendsByProfileId(currentUserProfile.getId());

        // Extract profiles the user is following
        List<Profile> followedProfiles = new ArrayList<>();

        for (FriendsList friendship : acceptedFriendships) {
            if (friendship.getRequestedByProfile().getId().equals(currentUserProfile.getId())) {
                // User sent the request, so they're following requestedToProfile
                followedProfiles.add(friendship.getRequestedToProfile());
            } else if (friendship.getRequestedToProfile().getId().equals(currentUserProfile.getId())) {
                // User received and accepted the request, so they're following requestedByProfile
                followedProfiles.add(friendship.getRequestedByProfile());
            }
        }

        return ResponseEntity.ok().body(followedProfiles);
    }

    /**
     * Helper method to get the current username from the security context
     * This handles both JWT and session-based authentication
     */
    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }

        // First try getName(), which works for most authentication types
        String username = auth.getName();
        if (username != null && !username.equals("anonymousUser")) {
            return username;
        }

        // If that fails, try to get the principal
        Object principal = auth.getPrincipal();
        if (principal instanceof org.springframework.security.core.userdetails.User) {
            return ((org.springframework.security.core.userdetails.User) principal).getUsername();
        }

        return null;
    }
}
