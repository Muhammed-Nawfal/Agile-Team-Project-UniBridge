package bham.team.web.rest;

import bham.team.domain.Profile;
import bham.team.domain.enumeration.ActivityType;
import bham.team.repository.ProfileRepository;
import bham.team.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.StreamSupport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link bham.team.domain.Profile}.
 */
@RestController
@RequestMapping("/api/profiles")
@Transactional
public class ProfileResource {

    private static final Logger LOG = LoggerFactory.getLogger(ProfileResource.class);

    private static final String ENTITY_NAME = "profile";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ProfileRepository profileRepository;

    public ProfileResource(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    /**
     * {@code POST  /profiles} : Create a new profile.
     *
     * @param profile the profile to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new profile, or with status {@code 400 (Bad Request)} if the profile has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<Profile> createProfile(@Valid @RequestBody Profile profile) throws URISyntaxException {
        LOG.debug("REST request to save Profile : {}", profile);
        if (profile.getId() != null) {
            throw new BadRequestAlertException("A new profile cannot already have an ID", ENTITY_NAME, "idexists");
        }
        profile = profileRepository.save(profile);
        return ResponseEntity.created(new URI("/api/profiles/" + profile.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, profile.getId().toString()))
            .body(profile);
    }

    /**
     * {@code PUT  /profiles/:id} : Updates an existing profile.
     *
     * @param id the id of the profile to save.
     * @param profile the profile to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated profile,
     * or with status {@code 400 (Bad Request)} if the profile is not valid,
     * or with status {@code 500 (Internal Server Error)} if the profile couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Profile> updateProfile(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody Profile profile
    ) throws URISyntaxException {
        LOG.debug("REST request to update Profile : {}, {}", id, profile);
        if (profile.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, profile.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!profileRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        profile = profileRepository.save(profile);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, profile.getId().toString()))
            .body(profile);
    }

    /**
     * {@code PATCH  /profiles/:id} : Partial updates given fields of an existing profile, field will ignore if it is null
     *
     * @param id the id of the profile to save.
     * @param profile the profile to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated profile,
     * or with status {@code 400 (Bad Request)} if the profile is not valid,
     * or with status {@code 404 (Not Found)} if the profile is not found,
     * or with status {@code 500 (Internal Server Error)} if the profile couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Profile> partialUpdateProfile(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Profile profile
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Profile partially : {}, {}", id, profile);
        if (profile.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, profile.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!profileRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Profile> result = profileRepository
            .findById(profile.getId())
            .map(existingProfile -> {
                if (profile.getLogin() != null) {
                    existingProfile.setLogin(profile.getLogin());
                }
                if (profile.getFirstName() != null) {
                    existingProfile.setFirstName(profile.getFirstName());
                }
                if (profile.getLastName() != null) {
                    existingProfile.setLastName(profile.getLastName());
                }
                if (profile.getBio() != null) {
                    existingProfile.setBio(profile.getBio());
                }
                if (profile.getProfilePicture() != null) {
                    existingProfile.setProfilePicture(profile.getProfilePicture());
                }
                if (profile.getProfilePictureContentType() != null) {
                    existingProfile.setProfilePictureContentType(profile.getProfilePictureContentType());
                }
                if (profile.getCourse() != null) {
                    existingProfile.setCourse(profile.getCourse());
                }
                if (profile.getCourseYear() != null) {
                    existingProfile.setCourseYear(profile.getCourseYear());
                }
                if (profile.getUniversity() != null) {
                    existingProfile.setUniversity(profile.getUniversity());
                }
                if (profile.getGymSkill() != null) {
                    existingProfile.setGymSkill(profile.getGymSkill());
                }
                if (profile.getGymLocation() != null) {
                    existingProfile.setGymLocation(profile.getGymLocation());
                }
                if (profile.getGymTime() != null) {
                    existingProfile.setGymTime(profile.getGymTime());
                }
                if (profile.getStudyTime() != null) {
                    existingProfile.setStudyTime(profile.getStudyTime());
                }
                if (profile.getSports() != null) {
                    existingProfile.setSports(profile.getSports());
                }
                if (profile.getSportsSkill() != null) {
                    existingProfile.setSportsSkill(profile.getSportsSkill());
                }
                if (profile.getSportsTime() != null) {
                    existingProfile.setSportsTime(profile.getSportsTime());
                }
                if (profile.getPreferredSociety() != null) {
                    existingProfile.setPreferredSociety(profile.getPreferredSociety());
                }
                if (profile.getPreferredEvents() != null) {
                    existingProfile.setPreferredEvents(profile.getPreferredEvents());
                }
                if (profile.getEventsTime() != null) {
                    existingProfile.setEventsTime(profile.getEventsTime());
                }
                if (profile.getPreferredActivities() != null) {
                    existingProfile.setPreferredActivities(profile.getPreferredActivities());
                }

                return existingProfile;
            })
            .map(profileRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, profile.getId().toString())
        );
    }

    /**
     * {@code GET  /profiles} : get all the profiles.
     *
     * @param filter the filter of the request.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of profiles in body.
     */
    @GetMapping("")
    public List<Profile> getAllProfiles(@RequestParam(name = "filter", required = false) String filter) {
        if ("ranking-is-null".equals(filter)) {
            LOG.debug("REST request to get all Profiles where ranking is null");
            return StreamSupport.stream(profileRepository.findAll().spliterator(), false)
                .filter(profile -> profile.getRanking() == null)
                .toList();
        }
        LOG.debug("REST request to get all Profiles");
        return profileRepository.findAll();
    }

    /**
     * {@code GET  /profiles/:id} : get the "id" profile.
     *
     * @param id the id of the profile to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the profile, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Profile> getProfile(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Profile : {}", id);
        Optional<Profile> profile = profileRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(profile);
    }

    /**
     * {@code DELETE  /profiles/:id} : delete the "id" profile.
     *
     * @param id the id of the profile to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProfile(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Profile : {}", id);
        profileRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    @GetMapping("/preferred-activity")
    public ResponseEntity<List<Profile>> getProfilesByPreferredActivity(@RequestParam ActivityType activityType) {
        LOG.debug("REST request to get Profiles by activityType: {}", activityType);

        List<Profile> profiles = profileRepository.findByPreferredActivity(activityType);
        return ResponseEntity.ok(profiles);
    }
}
