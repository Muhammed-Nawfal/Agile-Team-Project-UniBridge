package bham.team.service;

import bham.team.domain.Profile;
import bham.team.domain.enumeration.ActivityType;
import bham.team.repository.ProfileRepository;
import bham.team.repository.specification.ProfileSpecifications;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ProfileService {

    private final ProfileRepository repository;

    public ProfileService(ProfileRepository repository) {
        this.repository = repository;
    }

    /** Find all profiles with any non‐null field for the given activity type */
    public List<Profile> findByActivityType(ActivityType type) {
        return repository.findAll(ProfileSpecifications.byActivityType(type));
    }

    @Transactional
    public void anonymize(Long id) {
        repository
            .findById(id)
            .ifPresent(profile -> {
                profile.setBio(null);
                profile.setProfilePicture(null);
                profile.setProfilePictureContentType(null);
                profile.setGymLocation(null);
                profile.setGymSkill(null);
                profile.setSports(null);
                profile.setSportsSkill(null);
                profile.setSportsTime(null);
                profile.setPreferredSociety(null);
                profile.setPreferredEvents(null);
                profile.setPreferredActivities(null);
                profile.setStudyTime(null);
                profile.setGymTime(null);
                profile.setEventsTime(null);
                repository.save(profile);
            });
    }
}
