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
}
