package bham.team.repository;

import bham.team.domain.ActivityParticipant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the ActivityParticipant entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ActivityParticipantRepository extends JpaRepository<ActivityParticipant, Long> {
    Optional<ActivityParticipant> findByParticipantIdAndActivityId(Long profileId, Long activityId);

    List<ActivityParticipant> findByParticipantId(Long profileId);

    List<ActivityParticipant> findByActivityId(Long activityId);
}
