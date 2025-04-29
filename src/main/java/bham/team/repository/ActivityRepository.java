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
    @Query(
        "SELECT a FROM Activity a WHERE " +
        "LOWER(a.activityName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(a.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(a.location) LIKE LOWER(CONCAT('%', :searchTerm, '%'))"
    )
    Page<Activity> searchActivities(@Param("searchTerm") String searchTerm, Pageable pageable);

    @Query(
        "SELECT a FROM Activity a WHERE " +
        "(:searchTerm IS NULL OR LOWER(a.activityName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(a.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(a.location) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
        "(:activityType IS NULL OR a.activityType = :activityType) AND " +
        "(:status IS NULL OR a.status = :status) AND " +
        "(:minDate IS NULL OR a.activityDate >= :minDate) AND " +
        "(:maxDate IS NULL OR a.activityDate <= :maxDate) AND " +
        "(:isPaid IS NULL OR a.isPaid = :isPaid)"
    )
    Page<Activity> advancedSearch(
        @Param("searchTerm") String searchTerm,
        @Param("activityType") ActivityType activityType,
        @Param("status") Status status,
        @Param("minDate") Instant minDate,
        @Param("maxDate") Instant maxDate,
        @Param("isPaid") Boolean isPaid,
        Pageable pageable
    );
}
