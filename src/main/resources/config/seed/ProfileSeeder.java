package bham.team.config.seed;

import bham.team.domain.Profile;
import bham.team.domain.User;
import bham.team.domain.enumeration.*;
import bham.team.repository.ProfileRepository;
import bham.team.repository.UserRepository;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("prod")
public class ProfileSeeder implements CommandLineRunner {

    private final Logger log = LoggerFactory.getLogger(ProfileSeeder.class);
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;

    public ProfileSeeder(UserRepository userRepository, ProfileRepository profileRepository) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
    }

    @Override
    public void run(String... args) {
        log.info("Running production profile seeder...");

        if (profileRepository.count() > 0) {
            log.info("Profiles already exist, skipping seeding.");
            return;
        }

        List<Long> userIds = Arrays.asList(1L, 2L, 3L, 4L, 5L, 6L, 7L, 8L, 9L, 10L);
        for (Long userId : userIds) {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                log.warn("User with ID {} not found. Skipping.", userId);
                continue;
            }

            User user = userOpt.get();

            Profile profile = new Profile();
            profile.setUser(user);
            profile.setFirstName(user.getFirstName());
            profile.setLastName(user.getLastName());
            profile.setLogin(user.getLogin());
            profile.setBio("This is a seeded production profile for " + user.getLogin());
            profile.setCourse(getRandomEnum(Course.class));
            profile.setCourseYear((long) (new Random().nextInt(4) + 1));
            profile.setUniversity(getRandomEnum(University.class));
            profile.setGymSkill(getRandomEnum(Skill.class));
            profile.setGymLocation(getRandomEnum(GymLocation.class));
            profile.setGymTime(getRandomEnum(PreferredTime.class));
            profile.setStudyTime(getRandomEnum(PreferredTime.class));
            profile.setSports(getRandomEnum(Sports.class));
            profile.setSportsSkill(getRandomEnum(Skill.class));
            profile.setSportsTime(getRandomEnum(PreferredTime.class));
            profile.setPreferredSociety(getRandomEnum(Society.class));
            profile.setPreferredEvents(getRandomEnum(PreferredEvents.class));
            profile.setEventsTime(getRandomEnum(PreferredTime.class));
            profile.setPreferredActivities(getRandomEnum(ActivityType.class));

            profileRepository.save(profile);
            log.info("Seeded profile for user: {}", user.getLogin());
        }
    }

    private static <T extends Enum<?>> T getRandomEnum(Class<T> clazz) {
        T[] constants = clazz.getEnumConstants();
        return constants[new Random().nextInt(constants.length)];
    }
}
