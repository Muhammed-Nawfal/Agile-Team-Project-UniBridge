package bham.team.repository;

import bham.team.domain.Activity;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Activity entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    @Query("select activity from Activity activity where activity.requesteduser.login = ?#{authentication.name}")
    List<Activity> findByRequesteduserIsCurrentUser();
}
