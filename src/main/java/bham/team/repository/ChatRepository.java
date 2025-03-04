package bham.team.repository;

import bham.team.domain.Chat;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Chat entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {
    @Query("select chat from Chat chat where chat.senderID.login = ?#{authentication.name}")
    List<Chat> findBySenderIDIsCurrentUser();

    @Query("select chat from Chat chat where chat.recieverID.login = ?#{authentication.name}")
    List<Chat> findByRecieverIDIsCurrentUser();
}
