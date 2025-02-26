package bham.team.repository;

import bham.team.domain.ActivityMatch;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the ActivityMatch entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ActivityMatchRepository extends JpaRepository<ActivityMatch, Long> {
    @Query("select activityMatch from ActivityMatch activityMatch where activityMatch.requestUser.login = ?#{authentication.name}")
    List<ActivityMatch> findByRequestUserIsCurrentUser();

    @Query("select activityMatch from ActivityMatch activityMatch where activityMatch.matchedUser.login = ?#{authentication.name}")
    List<ActivityMatch> findByMatchedUserIsCurrentUser();
}
