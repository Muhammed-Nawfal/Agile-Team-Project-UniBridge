package bham.team.repository.specification;

import bham.team.domain.Profile;
import bham.team.domain.enumeration.ActivityType;
import org.springframework.data.jpa.domain.Specification;

public class ProfileSpecifications {

    public static Specification<Profile> hasAnyGymField() {
        return (root, query, cb) ->
            cb.or(cb.isNotNull(root.get("gymSkill")), cb.isNotNull(root.get("gymLocation")), cb.isNotNull(root.get("gymTime")));
    }

    public static Specification<Profile> hasAnySportsField() {
        return (root, query, cb) ->
            cb.or(cb.isNotNull(root.get("sports")), cb.isNotNull(root.get("sportsSkill")), cb.isNotNull(root.get("sportsTime")));
    }

    public static Specification<Profile> hasAnyEventsField() {
        return (root, query, cb) ->
            cb.or(
                cb.isNotNull(root.get("preferredSociety")),
                cb.isNotNull(root.get("preferredEvents")),
                cb.isNotNull(root.get("eventsTime"))
            );
    }

    public static Specification<Profile> hasAnyStudyField() {
        return (root, query, cb) -> cb.or(cb.isNotNull(root.get("studyTime")));
    }

    public static Specification<Profile> byActivityType(ActivityType type) {
        return switch (type) {
            case GYM -> hasAnyGymField();
            case SPORTS -> hasAnySportsField();
            case ACADEMIC -> hasAnyStudyField();
            case SOCIAL -> hasAnyEventsField();
            default -> (root, query, cb) -> cb.disjunction(); // empty result
        };
    }
}
