package bham.team.repository;

import bham.team.domain.FriendsList;
import bham.team.domain.Profile;
import bham.team.domain.Review;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Review entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    // Find all reviews written by a specific profile

    @Query("SELECT r FROM Review r WHERE r.fromUser = :profile")
    List<Review> findReviewsByProfile(@Param("profile") Profile profile);

    // Find all reviews received by a specific profile

    @Query("SELECT r FROM Review r WHERE r.aboutUser = :profile")
    List<Review> findReviewsForProfile(@Param("profile") Profile profile);

    /**
     * Get the login of fromUser for a given Review entity
     */
    @Query("SELECT r.fromUser.login FROM Review r WHERE r.id = :reviewId")
    String getFromUserLoginById(@Param("reviewId") Long reviewId);
}
