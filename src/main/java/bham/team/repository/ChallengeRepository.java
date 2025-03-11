package bham.team.repository;

import bham.team.domain.Challenge;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Challenge entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ChallengeRepository extends JpaRepository<Challenge, Long> {
    @Query("select challenge from Challenge challenge where challenge.creator.login = ?#{authentication.name}")
    List<Challenge> findByCreatorIsCurrentUser();

    @Query("select challenge from Challenge challenge where challenge.recipient.login = ?#{authentication.name}")
    List<Challenge> findByRecipientIsCurrentUser();
}
