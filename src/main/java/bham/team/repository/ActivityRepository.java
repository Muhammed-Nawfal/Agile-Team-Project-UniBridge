package bham.team.repository;

import bham.team.domain.Activity;
import bham.team.domain.enumeration.ActivityType;
import bham.team.domain.enumeration.Status;
import java.time.Instant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Activity entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    Page<Activity> findByActivityNameContainingIgnoreCase(String query, Pageable pageable);
    // Add this method to your existing repository
    Page<Activity> findByCreatorId(Long creatorId, Pageable pageable);
}
