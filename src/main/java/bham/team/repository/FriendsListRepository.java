package bham.team.repository;

import bham.team.domain.FriendsList;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the FriendsList entity.
 */
@SuppressWarnings("unused")
@Repository
public interface FriendsListRepository extends JpaRepository<FriendsList, Long> {
    @Query("select friendsList from FriendsList friendsList where friendsList.user.login = ?#{authentication.name}")
    List<FriendsList> findByUserIsCurrentUser();

    @Query("select friendsList from FriendsList friendsList where friendsList.friend.login = ?#{authentication.name}")
    List<FriendsList> findByFriendIsCurrentUser();
}
