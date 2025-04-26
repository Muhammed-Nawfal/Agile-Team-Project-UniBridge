package bham.team.service; // Adjust to your actual package

import bham.team.domain.ActivityMatch;
import bham.team.domain.Profile;
import bham.team.domain.enumeration.ActivityType;
import bham.team.repository.ActivityMatchRepository;
import bham.team.repository.ProfileRepository;
//import bham.team.service.mapper.ActivityMatchMapper;
import bham.team.service.mapper.ProfileMapper;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ActivityMatchService {

    private final Logger log = LoggerFactory.getLogger(ActivityMatchService.class);

    private final ActivityMatchRepository activityMatchRepository;
    private final ProfileRepository profileRepository;
    private final ProfileMapper profileMapper;

    public ActivityMatchService(
        ActivityMatchRepository activityMatchRepository,
        ProfileRepository profileRepository,
        ProfileMapper profileMapper
    ) {
        this.activityMatchRepository = activityMatchRepository;
        this.profileRepository = profileRepository;
        this.profileMapper = profileMapper;
    }

    /**
     * Get profiles that have a specific preferred activity
     *
     * @param activityType the activity type to search for
     * @return List of profiles with the specified preferred activity
     */

    //    @Transactional(readOnly = true)
    //    public List<Profile> getProfilesByPreferredActivity(ActivityType activityType) {
    //        log.debug("Request to get profiles by preferred activity: {}", activityType);
    //        if (activityType == null) {
    //            throw new IllegalArgumentException("Activity type cannot be null");
    //        }
    //        List<Profile> profiles = profileRepository.findByPreferredActivity(activityType);
    //
    //    }

    @Transactional(readOnly = true)
    public List<Profile> getProfilesByPreferredActivity(ActivityType activityType) {
        log.debug("Request to get profiles by preferred activity: {}", activityType);
        return profileRepository.findByPreferredActivity(activityType);
    }

    /**
     * Create a new activity match between users
     *
     * @param activityMatch the entity to save
     * @return the persisted entity
     */
    public ActivityMatch save(ActivityMatch activityMatch) {
        log.debug("Request to save ActivityMatch : {}", activityMatch);
        return activityMatchRepository.save(activityMatch);
    }
}
