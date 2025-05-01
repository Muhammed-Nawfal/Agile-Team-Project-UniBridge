package bham.team.repository;

import bham.team.domain.Profile;
import bham.team.domain.enumeration.ActivityType;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Profile entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ProfileRepository extends JpaRepository<Profile, Long> {
    @Query("SELECT DISTINCT profile FROM Profile profile " + "WHERE profile.preferredActivities = :activityType")
    List<Profile> findByPreferredActivity(@Param("activityType") ActivityType activityType);
}
