package bham.team.repository;

import bham.team.domain.Event;
import bham.team.domain.TimeSlot;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the TimeSlot entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {
    boolean existsByDateAndEvent(LocalDate targetDate, Event event);

    boolean existsByDateAndEventAndStartHourAndEndHour(LocalDate targetDate, Event event, Integer startHour, Integer endHour);

    Optional<TimeSlot> findByDateAndEventAndStartHourAndEndHour(LocalDate date, Event event, Integer startHour, Integer endHour);
}
