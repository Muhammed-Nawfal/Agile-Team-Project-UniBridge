package bham.team.repository.specification;

import bham.team.domain.Profile;
import bham.team.domain.enumeration.ActivityType;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
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

    public static Specification<Profile> byFilters(ActivityType type, String f1, String f2, String f3) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            switch (type) {
                case GYM -> {
                    if (f1 != null && !f1.isBlank()) predicates.add(cb.equal(root.get("gymLocation"), f1));
                    if (f2 != null && !f2.isBlank()) predicates.add(cb.equal(root.get("gymSkill"), f2));
                    if (f3 != null && !f3.isBlank()) predicates.add(cb.equal(root.get("gymTime"), f3));
                }
                case ACADEMIC -> {
                    if (f1 != null && !f1.isBlank()) predicates.add(cb.equal(root.get("course"), f1));
                    if (f2 != null && !f2.isBlank()) predicates.add(cb.equal(root.get("university"), f2));
                    if (f3 != null && !f3.isBlank()) predicates.add(cb.equal(root.get("studyTime"), f3));
                }
                case SPORTS -> {
                    if (f1 != null && !f1.isBlank()) predicates.add(cb.equal(root.get("sports"), f1));
                    if (f2 != null && !f2.isBlank()) predicates.add(cb.equal(root.get("sportsSkill"), f2));
                    if (f3 != null && !f3.isBlank()) predicates.add(cb.equal(root.get("sportsTime"), f3));
                }
                case SOCIAL -> {
                    if (f1 != null && !f1.isBlank()) predicates.add(cb.equal(root.get("preferredSociety"), f1));
                    if (f2 != null && !f2.isBlank()) predicates.add(cb.equal(root.get("preferredEvents"), f2));
                    if (f3 != null && !f3.isBlank()) predicates.add(cb.equal(root.get("eventsTime"), f3));
                }
                default -> {}
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
