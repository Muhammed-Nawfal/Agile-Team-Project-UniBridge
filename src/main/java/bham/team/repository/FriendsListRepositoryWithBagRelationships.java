package bham.team.repository;

import bham.team.domain.FriendsList;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;

public interface FriendsListRepositoryWithBagRelationships {
    Optional<FriendsList> fetchBagRelationships(Optional<FriendsList> friendsList);

    List<FriendsList> fetchBagRelationships(List<FriendsList> friendsLists);

    Page<FriendsList> fetchBagRelationships(Page<FriendsList> friendsLists);
}
