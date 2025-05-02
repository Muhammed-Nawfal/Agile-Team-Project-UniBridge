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

        // checks if the activity is already full
        if (activity.getNumberOfParticipants() >= activity.getMaxNumberOfParticipants()) {
            throw new BadRequestAlertException("Activity is already full", "activityParticipant", "activityfull");
        }

        // Create new ActivityParticipant
        ActivityParticipant activityParticipant = new ActivityParticipant();
        activityParticipant.setJoinedDate(Instant.now());
        activityParticipant.setStatus(ParticipationStatus.CONFIRMED);
        activityParticipant.setParticipant(profile);
        activityParticipant.setActivity(activity);

        // Increment the number of participants
        activity.setNumberOfParticipants(activity.getNumberOfParticipants() + 1);
        activity.setUpdatedOn(Instant.now());

        // Save the activity with updated participants count
        activityRepository.save(activity);

        // Save and return the activity participant
        return activityParticipantRepository.save(activityParticipant);
    }
}
