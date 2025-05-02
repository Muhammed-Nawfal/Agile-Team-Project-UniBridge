package bham.team.service;

import bham.team.domain.Activity;
import bham.team.domain.ActivityParticipant;
import bham.team.domain.Profile;
import bham.team.domain.enumeration.ParticipationStatus;
import bham.team.domain.enumeration.Status;
import bham.team.repository.ActivityParticipantRepository;
import bham.team.repository.ActivityRepository;
import bham.team.repository.ProfileRepository;
import bham.team.web.rest.errors.BadRequestAlertException;
import jakarta.transaction.Transactional;
import java.time.Instant;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class ActivityParticipantService {

    private final Logger LOG = LoggerFactory.getLogger(ActivityParticipantService.class);

    private final ActivityParticipantRepository activityParticipantRepository;
    private final ActivityRepository activityRepository;
    private final ProfileRepository profileRepository;

    public ActivityParticipantService(
        ActivityParticipantRepository activityParticipantRepository,
        ActivityRepository activityRepository,
        ProfileRepository profileRepository
    ) {
        this.activityParticipantRepository = activityParticipantRepository;
        this.activityRepository = activityRepository;
        this.profileRepository = profileRepository;
    }

    /**
     * Join an activity for the current logged-in user.
     *
     * @param activityId the ID of the activity to join
     * @return the persisted ActivityParticipant entity
     * @throws BadRequestAlertException if the activity is full or user has already joined
     */
    public ActivityParticipant joinActivity(Long activityId) {
        // get the current logged in user
        Profile profile = profileRepository
            .findByUserIsCurrentUser()
            .orElseThrow(() -> new BadRequestAlertException("User profile not found", "activityParticipant", "profilenotfound"));

        // get the activity
        Activity activity = activityRepository
            .findById(activityId)
            .orElseThrow(() -> new BadRequestAlertException("Activity not found", "activityParticipant", "activitynotfound"));

        // checks if the activity can be joined i.e. if it has not finished
        if (activity.getStatus() != Status.ANNOUNCED && activity.getStatus() != Status.CURRENTLY_HAPPENING) {
            throw new BadRequestAlertException("Activity is not open for joining", "activityParticipant", "activitynotopen");
        }

        // checks if the user has already joined this activity
        if (activityParticipantRepository.findByParticipantIdAndActivityId(profile.getId(), activityId).isPresent()) {
            throw new BadRequestAlertException("You have already joined this activity", "activityParticipant", "alreadyjoined");
        }

        // checks if the activity is already full
        if (activity.getNumberOfParticipants() >= activity.getMaxNumberOfParticipants()) {
            throw new BadRequestAlertException("Activity is already full", "activityParticipant", "activityfull");
        }

        // creation of the  new ActivityParticipant
        ActivityParticipant activityParticipant = new ActivityParticipant();
        activityParticipant.setJoinedDate(Instant.now());
        activityParticipant.setStatus(ParticipationStatus.CONFIRMED);
        activityParticipant.setParticipant(profile);
        activityParticipant.setActivity(activity);

        // increments the # of participants
        activity.setNumberOfParticipants(activity.getNumberOfParticipants() + 1);
        activity.setUpdatedOn(Instant.now());

        // saves the activity with updated participants count
        activityRepository.save(activity);

        // saves and returns the activity participant
        return activityParticipantRepository.save(activityParticipant);
    }

    /**
     * Check if the current user has joined an activity.
     *
     * @param activityId the ID of the activity to check
     * @return true if the user has joined, false otherwise
     */
    public boolean hasUserJoinedActivity(Long activityId) {
        Profile profile = profileRepository
            .findByUserIsCurrentUser()
            .orElseThrow(() -> new BadRequestAlertException("User profile not found", "activityParticipant", "profilenotfound"));

        return activityParticipantRepository.findByParticipantIdAndActivityId(profile.getId(), activityId).isPresent();
    }

    /**
     * Find all participants for an activity.
     *
     * @param activityId the ID of the activity
     * @return the list of activity participants
     */
    public List<ActivityParticipant> findParticipantsByActivityId(Long activityId) {
        return activityParticipantRepository.findByActivityId(activityId);
    }

    /**
     * Find all activities joined by the current user.
     *
     * @return the list of activity participants
     */
    public List<ActivityParticipant> findActivitiesByCurrentUser() {
        Profile profile = profileRepository
            .findByUserIsCurrentUser()
            .orElseThrow(() -> new BadRequestAlertException("User profile not found", "activityParticipant", "profilenotfound"));

        return activityParticipantRepository.findByParticipantId(profile.getId());
    }
}
