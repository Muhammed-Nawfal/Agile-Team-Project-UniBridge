package bham.team.repository;

import bham.team.domain.ActivityParticipant;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the ActivityParticipant entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ActivityParticipantRepository extends JpaRepository<ActivityParticipant, Long> {}
