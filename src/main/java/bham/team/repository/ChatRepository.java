package bham.team.repository;

import bham.team.domain.Chat;
import bham.team.domain.enumeration.MessageStatus;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Chat entity.
 */
@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {
    @Query("SELECT c FROM Chat c WHERE c.messageThread.id = :threadId ORDER BY c.timestamp ASC")
    List<Chat> findByMessageThreadIdOrderByTimestampAsc(@Param("threadId") Long threadId);

    @Query("SELECT c FROM Chat c WHERE c.messageThread.id = :threadId AND c.receiver.id = :receiverId AND c.status <> :status")
    List<Chat> findByMessageThreadIdAndReceiverIdAndStatusNot(
        @Param("threadId") Long threadId,
        @Param("receiverId") Long receiverId,
        @Param("status") MessageStatus status
    );

    // Add this method - it returns only active (non-deleted) messages
    @Query("SELECT c FROM Chat c WHERE c.messageThread.id = :threadId AND c.isDeleted = false ORDER BY c.timestamp ASC")
    List<Chat> findActiveMessagesByThreadId(@Param("threadId") Long threadId);
}
