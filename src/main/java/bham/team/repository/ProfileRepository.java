package bham.team.repository;

import bham.team.domain.Profile;
import bham.team.domain.enumeration.ActivityType;
import java.util.List;
import org.springframework.data.jpa.repository.*;

/**
 * Spring Data JPA repository for the Profile entity.
 */
@SuppressWarnings("unused")
public interface ProfileRepository extends JpaRepository<Profile, Long> {
    List<Profile> findByPreferredActivities(ActivityType activityType);
}
