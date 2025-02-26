package bham.team.repository;

import bham.team.domain.Review;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Review entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    @Query("select review from Review review where review.aboutUser.login = ?#{authentication.name}")
    List<Review> findByAboutUserIsCurrentUser();

    @Query("select review from Review review where review.fromUser.login = ?#{authentication.name}")
    List<Review> findByFromUserIsCurrentUser();
}
