package bham.team.service;

import bham.team.domain.Activity;
import bham.team.domain.enumeration.ActivityType;
import bham.team.domain.enumeration.Status;
import bham.team.repository.ActivityRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ActivityService {

    private final ActivityRepository activityRepository;

    public ActivityService(ActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    /**
     * Save an activity.
     *
     * @param activity the entity to save.
     * @return the persisted entity.
     */
    public Activity save(Activity activity) {
        return activityRepository.save(activity);
    }

    /**
     * Get all activities.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<Activity> findAll(Pageable pageable) {
        return activityRepository.findAll(pageable);
    }

    /**
     * Get one activity by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<Activity> findOne(Long id) {
        return activityRepository.findById(id);
    }

    /**
     * Delete the activity by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        activityRepository.deleteById(id);
    }

    /**
     * Search activities by keyword in name, description, and location.
     *
     * @param searchTerm the search term.
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<Activity> search(String searchTerm, Pageable pageable) {
        return activityRepository.searchActivities(searchTerm, pageable);
    }

    /**
     * Search activities with additional filters.
     *
     * @param searchTerm the search term.
     * @param activityType the activity type filter.
     * @param status the status filter.
     * @param minDate the minimum date filter.
     * @param maxDate the maximum date filter.
     * @param isPaid the isPaid filter.
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<Activity> advancedSearch(
        String searchTerm,
        ActivityType activityType,
        Status status,
        Instant minDate,
        Instant maxDate,
        Boolean isPaid,
        Pageable pageable
    ) {
        return activityRepository.advancedSearch(searchTerm, activityType, status, minDate, maxDate, isPaid, pageable);
    }
}
