package bham.team.repository;

import bham.team.domain.FriendsList;
import bham.team.domain.Profile;
import bham.team.domain.enumeration.Decision;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the FriendsList entity.
 */
@SuppressWarnings("unused")
@Repository
public interface FriendsListRepository extends JpaRepository<FriendsList, Long> {
    /**
     * Find all friend requests sent by a specific profile
     */
    @Query("SELECT f FROM FriendsList f WHERE f.requestedByProfile = :profile")
    List<FriendsList> findByRequestedByProfile(@Param("profile") Profile profile);

    /**
     * Find all friend requests received by a specific profile
     */
    @Query("SELECT f FROM FriendsList f WHERE f.requestedToProfile = :profile")
    List<FriendsList> findByRequestedToProfile(@Param("profile") Profile profile);

    /**
     * Find accepted friends for a specific profile (both sent and received requests)
     */
    @Query(
        "SELECT f FROM FriendsList f WHERE (f.requestedByProfile = :profile OR f.requestedToProfile = :profile) AND f.requestStatus = 'ACCEPT'"
    )
    List<FriendsList> findAcceptedFriendsByProfile(@Param("profile") Profile profile);

    /**
     * Find pending friend requests for a specific profile
     */
    @Query("SELECT f FROM FriendsList f WHERE f.requestedToProfile = :profile AND f.requestStatus = 'PENDING'")
    List<FriendsList> findPendingFriendRequestsByProfile(@Param("profile") Profile profile);

    /**
     * Check if a friend request already exists between two profiles (in either direction)
     */
    @Query(
        "SELECT f FROM FriendsList f WHERE " +
        "(f.requestedByProfile = :profile1 AND f.requestedToProfile = :profile2) OR " +
        "(f.requestedByProfile = :profile2 AND f.requestedToProfile = :profile1)"
    )
    Optional<FriendsList> findExistingFriendRequest(@Param("profile1") Profile profile1, @Param("profile2") Profile profile2);

    /**
     * Get the login of a friend (requestedToProfile) for a given FriendsList entity
     */
    @Query("SELECT f.requestedToProfile.login FROM FriendsList f WHERE f.id = :friendsListId")
    String getFriendLoginById(@Param("friendsListId") Long friendsListId);

    /**
     * Get the logins of all friends who accepted a user's request
     */
    @Query("SELECT f.requestedToProfile.login FROM FriendsList f WHERE f.requestedByProfile = :profile AND f.requestStatus = 'ACCEPT'")
    List<String> getFriendLoginsForRequestedByProfile(@Param("profile") Profile profile);

    /**
     * Get the logins of all friends who sent requests to a user and were accepted
     */
    @Query("SELECT f.requestedByProfile.login FROM FriendsList f WHERE f.requestedToProfile = :profile AND f.requestStatus = 'ACCEPT'")
    List<String> getFriendLoginsForRequestedToProfile(@Param("profile") Profile profile);

    /**
     * Get all accepted friend logins for a profile (both directions)
     */
    @Query(
        "SELECT CASE WHEN f.requestedByProfile = :profile THEN f.requestedToProfile.login ELSE f.requestedByProfile.login END " +
        "FROM FriendsList f WHERE (f.requestedByProfile = :profile OR f.requestedToProfile = :profile) AND f.requestStatus = 'ACCEPT'"
    )
    List<String> getAllAcceptedFriendLogins(@Param("profile") Profile profile);
}
