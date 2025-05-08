package bham.team.service;

import bham.team.domain.FriendsList;
import bham.team.domain.Profile;
import bham.team.domain.enumeration.Decision;
import bham.team.repository.FriendsListRepository;
import bham.team.repository.ProfileRepository;
import bham.team.service.mapper.ProfileMapper;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link FriendsList}.
 */
@Service
@Transactional
public class FriendsListService {

    private final Logger log = LoggerFactory.getLogger(FriendsListService.class);

    private final FriendsListRepository friendsListRepository;
    private final ProfileRepository profileRepository;
    private final ProfileMapper profileMapper;

    public FriendsListService(
        FriendsListRepository friendsListRepository,
        ProfileRepository profileRepository,
        ProfileMapper profileMapper
    ) {
        this.friendsListRepository = friendsListRepository;
        this.profileRepository = profileRepository;
        this.profileMapper = profileMapper;
    }

    /**
     * Save a friendsList.
     *
     * @param friendsList the entity to save.
     * @return the persisted entity.
     */
    public FriendsList save(FriendsList friendsList) {
        log.debug("Request to save FriendsList : {}", friendsList);
        return friendsListRepository.save(friendsList);
    }

    /**
     * Send a friend request from one profile to another.
     * If a DECLINED relationship exists, it will update it to PENDING.
     *
     * @param requestorProfileId the ID of the profile sending the request
     * @param requestedProfileId the ID of the profile receiving the request
     * @return the created or updated friend request
     */
    public FriendsList sendFriendRequest(Long requestorProfileId, Long requestedProfileId) {
        log.debug("Request to send friend request from profile ID {} to profile ID {}", requestorProfileId, requestedProfileId);

        // Get both profiles
        Profile requestorProfile = profileRepository
            .findById(requestorProfileId)
            .orElseThrow(() -> new IllegalArgumentException("Requestor profile not found with ID: " + requestorProfileId));

        Profile requestedProfile = profileRepository
            .findById(requestedProfileId)
            .orElseThrow(() -> new IllegalArgumentException("Requested profile not found with ID: " + requestedProfileId));

        // Check if a friend request already exists between these profiles
        Optional<FriendsList> existingRequest = friendsListRepository.findExistingFriendRequest(requestorProfile, requestedProfile);

        if (existingRequest.isPresent()) {
            FriendsList existingFriendship = existingRequest.get();

            // If it's DECLINED, update to PENDING
            if (Decision.DECLINED.equals(existingFriendship.getRequestStatus())) {
                log.debug("Found DECLINED relationship (ID: {}), updating to PENDING", existingFriendship.getId());
                existingFriendship.setRequestStatus(Decision.PENDING);
                existingFriendship.setRequestTime(Instant.now());
                return friendsListRepository.save(existingFriendship);
            }

            log.debug("Friend request already exists between these profiles with status: {}", existingFriendship.getRequestStatus());
            return existingFriendship;
        }

        // Create and save new friend request
        FriendsList friendsList = new FriendsList();
        friendsList.setRequestedByProfile(requestorProfile);
        friendsList.setRequestedToProfile(requestedProfile);
        friendsList.setRequestTime(Instant.now());
        friendsList.setRequestStatus(Decision.PENDING);
        friendsList.setFriendSince(Instant.now()); // Set to satisfy @NotNull constraint

        log.debug("Creating new friend request");
        return friendsListRepository.save(friendsList);
    }

    /**
     * Update friendship status without restrictions on who can make the change
     * or what the previous status was.
     *
     * @param friendsListId the ID of the friends list to update
     * @param decision the new status (ACCEPT, DECLINED, or PENDING)
     * @return the updated friend request
     */
    public FriendsList updateFriendshipStatus(Long friendsListId, Decision decision) {
        log.debug("Request to update friendship status for ID {} to {}", friendsListId, decision);

        FriendsList friendsList = friendsListRepository
            .findById(friendsListId)
            .orElseThrow(() -> new IllegalArgumentException("Friend request not found with ID: " + friendsListId));

        log.debug("Updating friendship status from {} to {}", friendsList.getRequestStatus(), decision);
        friendsList.setRequestStatus(decision);

        if (decision == Decision.ACCEPT) {
            friendsList.setFriendSince(Instant.now());
        }

        return friendsListRepository.save(friendsList);
    }

    /**
     * Respond to a friend request.
     *
     * @param friendsListId the ID of the friends list to update
     * @param decision the decision (ACCEPT, DECLINED, or PENDING)
     * @return the updated friend request
     */
    public FriendsList respondToFriendRequest(Long friendsListId, Decision decision) {
        log.debug("Request to respond to friend request ID {} with decision {}", friendsListId, decision);

        FriendsList friendsList = friendsListRepository
            .findById(friendsListId)
            .orElseThrow(() -> new IllegalArgumentException("Friend request not found with ID: " + friendsListId));

        log.debug("Updating friendship status from {} to {}", friendsList.getRequestStatus(), decision);
        friendsList.setRequestStatus(decision);

        if (decision == Decision.ACCEPT) {
            friendsList.setFriendSince(Instant.now());
        }

        return friendsListRepository.save(friendsList);
    }

    /**
     * Get all accepted friends for a profile.
     *
     * @param profileId the ID of the profile
     * @return list of friends lists representing the profile's friends
     */
    @Transactional(readOnly = true)
    public List<FriendsList> getAcceptedFriendsByProfileId(Long profileId) {
        log.debug("Request to get accepted friends for profile ID {}", profileId);

        Profile profile = profileRepository
            .findById(profileId)
            .orElseThrow(() -> new IllegalArgumentException("Profile not found with ID: " + profileId));

        return friendsListRepository.findAcceptedFriendsByProfile(profile);
    }

    /**
     * Get all pending friend requests for a profile.
     *
     * @param profileId the ID of the profile
     * @return list of pending friend requests
     */
    @Transactional(readOnly = true)
    public List<FriendsList> getPendingFriendRequestsByProfileId(Long profileId) {
        log.debug("Request to get pending friend requests for profile ID {}", profileId);

        Profile profile = profileRepository
            .findById(profileId)
            .orElseThrow(() -> new IllegalArgumentException("Profile not found with ID: " + profileId));

        return friendsListRepository.findPendingFriendRequestsByProfile(profile);
    }

    /**
     * Get all friend requests sent by a profile.
     *
     * @param profileId the ID of the profile
     * @return list of friend requests sent by the profile
     */
    @Transactional(readOnly = true)
    public List<FriendsList> getSentFriendRequestsByProfileId(Long profileId) {
        log.debug("Request to get sent friend requests for profile ID {}", profileId);

        Profile profile = profileRepository
            .findById(profileId)
            .orElseThrow(() -> new IllegalArgumentException("Profile not found with ID: " + profileId));

        return friendsListRepository.findByRequestedByProfile(profile);
    }

    /**
     * Get the login of a friend from a FriendsList entity
     *
     * @param friendsListId the ID of the FriendsList entity
     * @return the login of the requested friend profile
     */
    @Transactional(readOnly = true)
    public String getFriendLoginById(Long friendsListId) {
        log.debug("Request to get friend login for FriendsList ID: {}", friendsListId);
        return friendsListRepository.getFriendLoginById(friendsListId);
    }

    /**
     * Get all accepted friend logins for a profile
     *
     * @param profileId the ID of the profile
     * @return list of friend logins
     */
    @Transactional(readOnly = true)
    public List<String> getAllAcceptedFriendLogins(Long profileId) {
        log.debug("Request to get all accepted friend logins for profile ID: {}", profileId);

        Profile profile = profileRepository
            .findById(profileId)
            .orElseThrow(() -> new IllegalArgumentException("Profile not found with ID: " + profileId));

        return friendsListRepository.getAllAcceptedFriendLogins(profile);
    }

    /**
     * Get all accepted friend logins for the current user
     *
     * @param currentUsername the current user's username
     * @return list of friend logins
     */
    @Transactional(readOnly = true)
    public List<String> getCurrentUserFriendLogins(String currentUsername) {
        log.debug("Request to get accepted friend logins for current user: {}", currentUsername);

        Profile profile = profileRepository
            .findByUserLogin(currentUsername)
            .orElseThrow(() -> new IllegalArgumentException("Profile not found for username: " + currentUsername));

        return friendsListRepository.getAllAcceptedFriendLogins(profile);
    }

    /**
     * Delete a friends list.
     * Note: This method should be used with caution due to constraints with MessageThread.
     * Consider using updateFriendshipStatus to DECLINED instead for unfollowing.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete FriendsList : {}", id);
        log.warn("CAUTION: Deleting a FriendsList record may cause related MessageThread records to be deleted as well.");
        log.warn("Consider using updateFriendshipStatus(id, Decision.DECLINED) instead for unfollowing.");
        friendsListRepository.deleteById(id);
    }
}
