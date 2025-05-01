package bham.team.repository;

import bham.team.domain.ActivityMatch;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the ActivityMatch entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ActivityMatchRepository extends JpaRepository<ActivityMatch, Long> {
    /**
     * Fetch all matches where the given user is either the requestor or the buddy,
     * and eagerly load both Profile relations so Jackson can serialize them.
     */
    @Query(
        """
          SELECT am
            FROM ActivityMatch am
            LEFT JOIN FETCH am.matchRequestor
            LEFT JOIN FETCH am.userDetails
           WHERE am.matchRequestor.id = :userId
              OR am.userDetails.id    = :userId
        """
    )
    List<ActivityMatch> findByUserInvolved(@Param("userId") Long userId);
}
