package bham.team.repository;

import bham.team.domain.Ranking;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Ranking entity.
 */
@SuppressWarnings("unused")
@Repository
public interface RankingRepository extends JpaRepository<Ranking, Long> {
    List<Ranking> findAllByRankGiven_Id(Long profileId);

    @Query("SELECT r.rankGiven.login FROM Ranking r")
    String getUserLoginById(@Param("rankingId") Long rankingId);
}
