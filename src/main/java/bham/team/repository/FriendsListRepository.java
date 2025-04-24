package bham.team.repository;

import bham.team.domain.FriendsList;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the FriendsList entity.
 */
@SuppressWarnings("unused")
@Repository
public interface FriendsListRepository extends JpaRepository<FriendsList, Long> {}
