package bham.team.repository;

import bham.team.domain.ActivityMatch;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the ActivityMatch entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ActivityMatchRepository extends JpaRepository<ActivityMatch, Long> {}
