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
}
