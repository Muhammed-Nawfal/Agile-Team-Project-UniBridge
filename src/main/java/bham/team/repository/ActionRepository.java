package bham.team.repository;

import bham.team.domain.Action;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Action entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ActionRepository extends JpaRepository<Action, Long> {
    @Query("select action from Action action where action.performedByID.login = ?#{authentication.name}")
    List<Action> findByPerformedByIDIsCurrentUser();

    @Query("select action from Action action where action.targetUserID.login = ?#{authentication.name}")
    List<Action> findByTargetUserIDIsCurrentUser();
}
