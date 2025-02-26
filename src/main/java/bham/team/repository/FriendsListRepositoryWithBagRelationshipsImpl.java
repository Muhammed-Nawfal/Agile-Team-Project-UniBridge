package bham.team.repository;

import bham.team.domain.FriendsList;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.stream.IntStream;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

/**
 * Utility repository to load bag relationships based on https://vladmihalcea.com/hibernate-multiplebagfetchexception/
 */
public class FriendsListRepositoryWithBagRelationshipsImpl implements FriendsListRepositoryWithBagRelationships {

    private static final String ID_PARAMETER = "id";
    private static final String FRIENDSLISTS_PARAMETER = "friendsLists";

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Optional<FriendsList> fetchBagRelationships(Optional<FriendsList> friendsList) {
        return friendsList.map(this::fetchUserIds).map(this::fetchFriendIds);
    }

    @Override
    public Page<FriendsList> fetchBagRelationships(Page<FriendsList> friendsLists) {
        return new PageImpl<>(
            fetchBagRelationships(friendsLists.getContent()),
            friendsLists.getPageable(),
            friendsLists.getTotalElements()
        );
    }

    @Override
    public List<FriendsList> fetchBagRelationships(List<FriendsList> friendsLists) {
        return Optional.of(friendsLists).map(this::fetchUserIds).map(this::fetchFriendIds).orElse(Collections.emptyList());
    }

    FriendsList fetchUserIds(FriendsList result) {
        return entityManager
            .createQuery(
                "select friendsList from FriendsList friendsList left join fetch friendsList.userIds where friendsList.id = :id",
                FriendsList.class
            )
            .setParameter(ID_PARAMETER, result.getId())
            .getSingleResult();
    }

    List<FriendsList> fetchUserIds(List<FriendsList> friendsLists) {
        HashMap<Object, Integer> order = new HashMap<>();
        IntStream.range(0, friendsLists.size()).forEach(index -> order.put(friendsLists.get(index).getId(), index));
        List<FriendsList> result = entityManager
            .createQuery(
                "select friendsList from FriendsList friendsList left join fetch friendsList.userIds where friendsList in :friendsLists",
                FriendsList.class
            )
            .setParameter(FRIENDSLISTS_PARAMETER, friendsLists)
            .getResultList();
        Collections.sort(result, (o1, o2) -> Integer.compare(order.get(o1.getId()), order.get(o2.getId())));
        return result;
    }

    FriendsList fetchFriendIds(FriendsList result) {
        return entityManager
            .createQuery(
                "select friendsList from FriendsList friendsList left join fetch friendsList.friendIds where friendsList.id = :id",
                FriendsList.class
            )
            .setParameter(ID_PARAMETER, result.getId())
            .getSingleResult();
    }

    List<FriendsList> fetchFriendIds(List<FriendsList> friendsLists) {
        HashMap<Object, Integer> order = new HashMap<>();
        IntStream.range(0, friendsLists.size()).forEach(index -> order.put(friendsLists.get(index).getId(), index));
        List<FriendsList> result = entityManager
            .createQuery(
                "select friendsList from FriendsList friendsList left join fetch friendsList.friendIds where friendsList in :friendsLists",
                FriendsList.class
            )
            .setParameter(FRIENDSLISTS_PARAMETER, friendsLists)
            .getResultList();
        Collections.sort(result, (o1, o2) -> Integer.compare(order.get(o1.getId()), order.get(o2.getId())));
        return result;
    }
}
