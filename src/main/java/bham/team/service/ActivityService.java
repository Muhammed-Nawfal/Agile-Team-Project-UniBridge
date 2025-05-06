package bham.team.service;

import bham.team.domain.Activity;
import bham.team.domain.Profile;
import bham.team.domain.enumeration.ActivityType;
import bham.team.domain.enumeration.Status;
import bham.team.repository.ActivityRepository;
import bham.team.repository.ProfileRepository;
import bham.team.security.SecurityUtils;
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
    private final ProfileRepository profileRepository;

    public ActivityService(ActivityRepository activityRepository, ProfileRepository profileRepository) {
        this.activityRepository = activityRepository;
        this.profileRepository = profileRepository;
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

    public Page<Activity> search(String query, Pageable pageable) {
        return activityRepository.findByActivityNameContainingIgnoreCase(query, pageable);
    }

    public boolean isCurrentUserActivityCreator(Long activityId) {
        Activity activity = activityRepository.findById(activityId).orElseThrow(() -> new IllegalStateException("Activity not found"));

        String userLogin = SecurityUtils.getCurrentUserLogin().orElseThrow(() -> new IllegalStateException("User login not found"));
        Profile profile = profileRepository.findByUserLogin(userLogin).orElseThrow(() -> new IllegalStateException("Profile not found"));

        return activity.getCreator() != null && activity.getCreator().getId().equals(profile.getId());
    }
}
