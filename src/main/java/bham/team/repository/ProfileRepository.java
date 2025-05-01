package bham.team.repository;

import bham.team.domain.Profile;
import bham.team.domain.enumeration.ActivityType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Profile entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ProfileRepository extends JpaRepository<Profile, Long> {
    /**
     * Find profiles with a specific preferred activity type
     */
    @Query("SELECT DISTINCT profile FROM Profile profile " + "WHERE profile.preferredActivities = :activityType")
    List<Profile> findByPreferredActivity(@Param("activityType") ActivityType activityType);
  
    /**
     * Find the profile for the currently logged-in user
     */
    @Query("SELECT profile FROM Profile profile " + "WHERE profile.login = ?#{principal.name}")
    Optional<Profile> findByUserIsCurrentUser();

    /**
     * Find a profile by user login
     */
    @Query("SELECT profile FROM Profile profile " + "WHERE profile.login = :login")
    Optional<Profile> findByUserLogin(@Param("login") String login);
}
