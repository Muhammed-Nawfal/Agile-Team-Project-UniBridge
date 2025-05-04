// MessageThreadRepository.java
package bham.team.repository;

import bham.team.domain.MessageThread;
import bham.team.domain.Profile;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageThreadRepository extends MessageThreadRepositoryWithBagRelationships, JpaRepository<MessageThread, Long> {
    @Query("SELECT DISTINCT mt FROM MessageThread mt LEFT JOIN FETCH mt.participants WHERE mt.id = :id")
    Optional<MessageThread> findOneWithParticipants(@Param("id") Long id);

    @Query("SELECT DISTINCT mt FROM MessageThread mt JOIN mt.participants p WHERE p.id = :profileId")
    List<MessageThread> findByParticipantId(@Param("profileId") Long profileId);

    @Query(
        "SELECT mt FROM MessageThread mt WHERE mt.friendChat.requestedByProfile.id = :profileId OR mt.friendChat.requestedToProfile.id = :profileId"
    )
    List<MessageThread> findFriendThreadsByProfileId(@Param("profileId") Long profileId);

    @Query("SELECT mt FROM MessageThread mt WHERE mt.friendChat.id = :friendsListId")
    Optional<MessageThread> findByFriendChatId(@Param("friendsListId") Long friendsListId);

    default Optional<MessageThread> findOneWithEagerRelationships(Long id) {
        return this.fetchBagRelationships(this.findById(id));
    }

    default List<MessageThread> findAllWithEagerRelationships() {
        return this.fetchBagRelationships(this.findAll());
    }

    default Page<MessageThread> findAllWithEagerRelationships(Pageable pageable) {
        return this.fetchBagRelationships(this.findAll(pageable));
    }
}
