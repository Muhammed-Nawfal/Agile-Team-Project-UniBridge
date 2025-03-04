package bham.team.repository;

import bham.team.domain.Booking;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Booking entity.
 */
@SuppressWarnings("unused")
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    @Query("select booking from Booking booking where booking.requestedUser.login = ?#{authentication.name}")
    List<Booking> findByRequestedUserIsCurrentUser();
}
