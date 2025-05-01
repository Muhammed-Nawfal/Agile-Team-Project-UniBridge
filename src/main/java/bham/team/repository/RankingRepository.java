package bham.team.repository;

import bham.team.domain.Ranking;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Ranking entity.
 */
@SuppressWarnings("unused")
@Repository
public interface RankingRepository extends JpaRepository<Ranking, Long> {}
