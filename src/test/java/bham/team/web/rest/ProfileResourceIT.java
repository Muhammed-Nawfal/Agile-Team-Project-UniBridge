package bham.team.web.rest;

import static bham.team.domain.ProfileAsserts.*;
import static bham.team.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import bham.team.IntegrationTest;
import bham.team.domain.Profile;
import bham.team.domain.enumeration.ActivityType;
import bham.team.domain.enumeration.Course;
import bham.team.domain.enumeration.GymLocation;
import bham.team.domain.enumeration.PreferredEvents;
import bham.team.domain.enumeration.PreferredTime;
import bham.team.domain.enumeration.PreferredTime;
import bham.team.domain.enumeration.PreferredTime;
import bham.team.domain.enumeration.PreferredTime;
import bham.team.domain.enumeration.Skill;
import bham.team.domain.enumeration.Skill;
import bham.team.domain.enumeration.Society;
import bham.team.domain.enumeration.Sports;
import bham.team.domain.enumeration.University;
import bham.team.repository.ProfileRepository;
import bham.team.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.util.Base64;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link ProfileResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class ProfileResourceIT {

    private static final String DEFAULT_LOGIN = "AAAAAAAAAA";
    private static final String UPDATED_LOGIN = "BBBBBBBBBB";

    private static final String DEFAULT_FIRST_NAME = "AAAAAAAAAA";
    private static final String UPDATED_FIRST_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_LAST_NAME = "AAAAAAAAAA";
    private static final String UPDATED_LAST_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_BIO = "AAAAAAAAAA";
    private static final String UPDATED_BIO = "BBBBBBBBBB";

    private static final byte[] DEFAULT_PROFILE_PICTURE = TestUtil.createByteArray(1, "0");
    private static final byte[] UPDATED_PROFILE_PICTURE = TestUtil.createByteArray(1, "1");
    private static final String DEFAULT_PROFILE_PICTURE_CONTENT_TYPE = "image/jpg";
    private static final String UPDATED_PROFILE_PICTURE_CONTENT_TYPE = "image/png";

    private static final Course DEFAULT_COURSE = Course.COMPUTER_SCIENCE;
    private static final Course UPDATED_COURSE = Course.ECONOMICS;

    private static final Long DEFAULT_COURSE_YEAR = 1L;
    private static final Long UPDATED_COURSE_YEAR = 2L;

    private static final University DEFAULT_UNIVERSITY = University.UNIVERSITY_OF_BIRMINGHAM;
    private static final University UPDATED_UNIVERSITY = University.ASTON_UNIVERSITY;

    private static final Skill DEFAULT_GYM_SKILL = Skill.NOVICE;
    private static final Skill UPDATED_GYM_SKILL = Skill.INTERMEDIATE;

    private static final GymLocation DEFAULT_GYM_LOCATION = GymLocation.THE_GYM_SELLY_OAK;
    private static final GymLocation UPDATED_GYM_LOCATION = GymLocation.TIVERTON;

    private static final PreferredTime DEFAULT_GYM_TIME = PreferredTime.EARLY_MORNING;
    private static final PreferredTime UPDATED_GYM_TIME = PreferredTime.MORNING;

    private static final PreferredTime DEFAULT_STUDY_TIME = PreferredTime.EARLY_MORNING;
    private static final PreferredTime UPDATED_STUDY_TIME = PreferredTime.MORNING;

    private static final Sports DEFAULT_SPORTS = Sports.FOOTBALL;
    private static final Sports UPDATED_SPORTS = Sports.CRICKET;

    private static final Skill DEFAULT_SPORTS_SKILL = Skill.NOVICE;
    private static final Skill UPDATED_SPORTS_SKILL = Skill.INTERMEDIATE;

    private static final PreferredTime DEFAULT_SPORTS_TIME = PreferredTime.EARLY_MORNING;
    private static final PreferredTime UPDATED_SPORTS_TIME = PreferredTime.MORNING;

    private static final Society DEFAULT_PREFERRED_SOCIETY = Society.ABACUS;
    private static final Society UPDATED_PREFERRED_SOCIETY = Society.ACCOUNTING_AND_FINANCE;

    private static final PreferredEvents DEFAULT_PREFERRED_EVENTS = PreferredEvents.GAMES_NIGHT;
    private static final PreferredEvents UPDATED_PREFERRED_EVENTS = PreferredEvents.MEET_AND_GREET;

    private static final PreferredTime DEFAULT_EVENTS_TIME = PreferredTime.EARLY_MORNING;
    private static final PreferredTime UPDATED_EVENTS_TIME = PreferredTime.MORNING;

    private static final ActivityType DEFAULT_PREFERRED_ACTIVITIES = ActivityType.SOCIAL;
    private static final ActivityType UPDATED_PREFERRED_ACTIVITIES = ActivityType.ACADEMIC;

    private static final String ENTITY_API_URL = "/api/profiles";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restProfileMockMvc;

    private Profile profile;

    private Profile insertedProfile;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Profile createEntity() {
        return new Profile()
            .login(DEFAULT_LOGIN)
            .firstName(DEFAULT_FIRST_NAME)
            .lastName(DEFAULT_LAST_NAME)
            .bio(DEFAULT_BIO)
            .profilePicture(DEFAULT_PROFILE_PICTURE)
            .profilePictureContentType(DEFAULT_PROFILE_PICTURE_CONTENT_TYPE)
            .course(DEFAULT_COURSE)
            .courseYear(DEFAULT_COURSE_YEAR)
            .university(DEFAULT_UNIVERSITY)
            .gymSkill(DEFAULT_GYM_SKILL)
            .gymLocation(DEFAULT_GYM_LOCATION)
            .gymTime(DEFAULT_GYM_TIME)
            .studyTime(DEFAULT_STUDY_TIME)
            .sports(DEFAULT_SPORTS)
            .sportsSkill(DEFAULT_SPORTS_SKILL)
            .sportsTime(DEFAULT_SPORTS_TIME)
            .preferredSociety(DEFAULT_PREFERRED_SOCIETY)
            .preferredEvents(DEFAULT_PREFERRED_EVENTS)
            .eventsTime(DEFAULT_EVENTS_TIME)
            .preferredActivities(DEFAULT_PREFERRED_ACTIVITIES);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Profile createUpdatedEntity() {
        return new Profile()
            .login(UPDATED_LOGIN)
            .firstName(UPDATED_FIRST_NAME)
            .lastName(UPDATED_LAST_NAME)
            .bio(UPDATED_BIO)
            .profilePicture(UPDATED_PROFILE_PICTURE)
            .profilePictureContentType(UPDATED_PROFILE_PICTURE_CONTENT_TYPE)
            .course(UPDATED_COURSE)
            .courseYear(UPDATED_COURSE_YEAR)
            .university(UPDATED_UNIVERSITY)
            .gymSkill(UPDATED_GYM_SKILL)
            .gymLocation(UPDATED_GYM_LOCATION)
            .gymTime(UPDATED_GYM_TIME)
            .studyTime(UPDATED_STUDY_TIME)
            .sports(UPDATED_SPORTS)
            .sportsSkill(UPDATED_SPORTS_SKILL)
            .sportsTime(UPDATED_SPORTS_TIME)
            .preferredSociety(UPDATED_PREFERRED_SOCIETY)
            .preferredEvents(UPDATED_PREFERRED_EVENTS)
            .eventsTime(UPDATED_EVENTS_TIME)
            .preferredActivities(UPDATED_PREFERRED_ACTIVITIES);
    }

    @BeforeEach
    public void initTest() {
        profile = createEntity();
    }

    @AfterEach
    public void cleanup() {
        if (insertedProfile != null) {
            profileRepository.delete(insertedProfile);
            insertedProfile = null;
        }
    }

    @Test
    @Transactional
    void createProfile() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Profile
        var returnedProfile = om.readValue(
            restProfileMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(profile)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            Profile.class
        );

        // Validate the Profile in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertProfileUpdatableFieldsEquals(returnedProfile, getPersistedProfile(returnedProfile));

        insertedProfile = returnedProfile;
    }

    @Test
    @Transactional
    void createProfileWithExistingId() throws Exception {
        // Create the Profile with an existing ID
        profile.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restProfileMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(profile)))
            .andExpect(status().isBadRequest());

        // Validate the Profile in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkLoginIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        profile.setLogin(null);

        // Create the Profile, which fails.

        restProfileMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(profile)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkFirstNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        profile.setFirstName(null);

        // Create the Profile, which fails.

        restProfileMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(profile)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkLastNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        profile.setLastName(null);

        // Create the Profile, which fails.

        restProfileMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(profile)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCourseIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        profile.setCourse(null);

        // Create the Profile, which fails.

        restProfileMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(profile)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCourseYearIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        profile.setCourseYear(null);

        // Create the Profile, which fails.

        restProfileMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(profile)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllProfiles() throws Exception {
        // Initialize the database
        insertedProfile = profileRepository.saveAndFlush(profile);

        // Get all the profileList
        restProfileMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(profile.getId().intValue())))
            .andExpect(jsonPath("$.[*].login").value(hasItem(DEFAULT_LOGIN)))
            .andExpect(jsonPath("$.[*].firstName").value(hasItem(DEFAULT_FIRST_NAME)))
            .andExpect(jsonPath("$.[*].lastName").value(hasItem(DEFAULT_LAST_NAME)))
            .andExpect(jsonPath("$.[*].bio").value(hasItem(DEFAULT_BIO.toString())))
            .andExpect(jsonPath("$.[*].profilePictureContentType").value(hasItem(DEFAULT_PROFILE_PICTURE_CONTENT_TYPE)))
            .andExpect(jsonPath("$.[*].profilePicture").value(hasItem(Base64.getEncoder().encodeToString(DEFAULT_PROFILE_PICTURE))))
            .andExpect(jsonPath("$.[*].course").value(hasItem(DEFAULT_COURSE.toString())))
            .andExpect(jsonPath("$.[*].courseYear").value(hasItem(DEFAULT_COURSE_YEAR.intValue())))
            .andExpect(jsonPath("$.[*].university").value(hasItem(DEFAULT_UNIVERSITY.toString())))
            .andExpect(jsonPath("$.[*].gymSkill").value(hasItem(DEFAULT_GYM_SKILL.toString())))
            .andExpect(jsonPath("$.[*].gymLocation").value(hasItem(DEFAULT_GYM_LOCATION.toString())))
            .andExpect(jsonPath("$.[*].gymTime").value(hasItem(DEFAULT_GYM_TIME.toString())))
            .andExpect(jsonPath("$.[*].studyTime").value(hasItem(DEFAULT_STUDY_TIME.toString())))
            .andExpect(jsonPath("$.[*].sports").value(hasItem(DEFAULT_SPORTS.toString())))
            .andExpect(jsonPath("$.[*].sportsSkill").value(hasItem(DEFAULT_SPORTS_SKILL.toString())))
            .andExpect(jsonPath("$.[*].sportsTime").value(hasItem(DEFAULT_SPORTS_TIME.toString())))
            .andExpect(jsonPath("$.[*].preferredSociety").value(hasItem(DEFAULT_PREFERRED_SOCIETY.toString())))
            .andExpect(jsonPath("$.[*].preferredEvents").value(hasItem(DEFAULT_PREFERRED_EVENTS.toString())))
            .andExpect(jsonPath("$.[*].eventsTime").value(hasItem(DEFAULT_EVENTS_TIME.toString())))
            .andExpect(jsonPath("$.[*].preferredActivities").value(hasItem(DEFAULT_PREFERRED_ACTIVITIES.toString())));
    }

    @Test
    @Transactional
    void getProfile() throws Exception {
        // Initialize the database
        insertedProfile = profileRepository.saveAndFlush(profile);

        // Get the profile
        restProfileMockMvc
            .perform(get(ENTITY_API_URL_ID, profile.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(profile.getId().intValue()))
            .andExpect(jsonPath("$.login").value(DEFAULT_LOGIN))
            .andExpect(jsonPath("$.firstName").value(DEFAULT_FIRST_NAME))
            .andExpect(jsonPath("$.lastName").value(DEFAULT_LAST_NAME))
            .andExpect(jsonPath("$.bio").value(DEFAULT_BIO.toString()))
            .andExpect(jsonPath("$.profilePictureContentType").value(DEFAULT_PROFILE_PICTURE_CONTENT_TYPE))
            .andExpect(jsonPath("$.profilePicture").value(Base64.getEncoder().encodeToString(DEFAULT_PROFILE_PICTURE)))
            .andExpect(jsonPath("$.course").value(DEFAULT_COURSE.toString()))
            .andExpect(jsonPath("$.courseYear").value(DEFAULT_COURSE_YEAR.intValue()))
            .andExpect(jsonPath("$.university").value(DEFAULT_UNIVERSITY.toString()))
            .andExpect(jsonPath("$.gymSkill").value(DEFAULT_GYM_SKILL.toString()))
            .andExpect(jsonPath("$.gymLocation").value(DEFAULT_GYM_LOCATION.toString()))
            .andExpect(jsonPath("$.gymTime").value(DEFAULT_GYM_TIME.toString()))
            .andExpect(jsonPath("$.studyTime").value(DEFAULT_STUDY_TIME.toString()))
            .andExpect(jsonPath("$.sports").value(DEFAULT_SPORTS.toString()))
            .andExpect(jsonPath("$.sportsSkill").value(DEFAULT_SPORTS_SKILL.toString()))
            .andExpect(jsonPath("$.sportsTime").value(DEFAULT_SPORTS_TIME.toString()))
            .andExpect(jsonPath("$.preferredSociety").value(DEFAULT_PREFERRED_SOCIETY.toString()))
            .andExpect(jsonPath("$.preferredEvents").value(DEFAULT_PREFERRED_EVENTS.toString()))
            .andExpect(jsonPath("$.eventsTime").value(DEFAULT_EVENTS_TIME.toString()))
            .andExpect(jsonPath("$.preferredActivities").value(DEFAULT_PREFERRED_ACTIVITIES.toString()));
    }

    @Test
    @Transactional
    void getNonExistingProfile() throws Exception {
        // Get the profile
        restProfileMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingProfile() throws Exception {
        // Initialize the database
        insertedProfile = profileRepository.saveAndFlush(profile);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the profile
        Profile updatedProfile = profileRepository.findById(profile.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedProfile are not directly saved in db
        em.detach(updatedProfile);
        updatedProfile
            .login(UPDATED_LOGIN)
            .firstName(UPDATED_FIRST_NAME)
            .lastName(UPDATED_LAST_NAME)
            .bio(UPDATED_BIO)
            .profilePicture(UPDATED_PROFILE_PICTURE)
            .profilePictureContentType(UPDATED_PROFILE_PICTURE_CONTENT_TYPE)
            .course(UPDATED_COURSE)
            .courseYear(UPDATED_COURSE_YEAR)
            .university(UPDATED_UNIVERSITY)
            .gymSkill(UPDATED_GYM_SKILL)
            .gymLocation(UPDATED_GYM_LOCATION)
            .gymTime(UPDATED_GYM_TIME)
            .studyTime(UPDATED_STUDY_TIME)
            .sports(UPDATED_SPORTS)
            .sportsSkill(UPDATED_SPORTS_SKILL)
            .sportsTime(UPDATED_SPORTS_TIME)
            .preferredSociety(UPDATED_PREFERRED_SOCIETY)
            .preferredEvents(UPDATED_PREFERRED_EVENTS)
            .eventsTime(UPDATED_EVENTS_TIME)
            .preferredActivities(UPDATED_PREFERRED_ACTIVITIES);

        restProfileMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedProfile.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedProfile))
            )
            .andExpect(status().isOk());

        // Validate the Profile in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedProfileToMatchAllProperties(updatedProfile);
    }

    @Test
    @Transactional
    void putNonExistingProfile() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        profile.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restProfileMockMvc
            .perform(put(ENTITY_API_URL_ID, profile.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(profile)))
            .andExpect(status().isBadRequest());

        // Validate the Profile in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchProfile() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        profile.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restProfileMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(profile))
            )
            .andExpect(status().isBadRequest());

        // Validate the Profile in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamProfile() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        profile.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restProfileMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(profile)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Profile in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateProfileWithPatch() throws Exception {
        // Initialize the database
        insertedProfile = profileRepository.saveAndFlush(profile);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the profile using partial update
        Profile partialUpdatedProfile = new Profile();
        partialUpdatedProfile.setId(profile.getId());

        partialUpdatedProfile
            .firstName(UPDATED_FIRST_NAME)
            .lastName(UPDATED_LAST_NAME)
            .courseYear(UPDATED_COURSE_YEAR)
            .university(UPDATED_UNIVERSITY)
            .gymLocation(UPDATED_GYM_LOCATION)
            .gymTime(UPDATED_GYM_TIME)
            .sports(UPDATED_SPORTS)
            .sportsSkill(UPDATED_SPORTS_SKILL);

        restProfileMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedProfile.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedProfile))
            )
            .andExpect(status().isOk());

        // Validate the Profile in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertProfileUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedProfile, profile), getPersistedProfile(profile));
    }

    @Test
    @Transactional
    void fullUpdateProfileWithPatch() throws Exception {
        // Initialize the database
        insertedProfile = profileRepository.saveAndFlush(profile);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the profile using partial update
        Profile partialUpdatedProfile = new Profile();
        partialUpdatedProfile.setId(profile.getId());

        partialUpdatedProfile
            .login(UPDATED_LOGIN)
            .firstName(UPDATED_FIRST_NAME)
            .lastName(UPDATED_LAST_NAME)
            .bio(UPDATED_BIO)
            .profilePicture(UPDATED_PROFILE_PICTURE)
            .profilePictureContentType(UPDATED_PROFILE_PICTURE_CONTENT_TYPE)
            .course(UPDATED_COURSE)
            .courseYear(UPDATED_COURSE_YEAR)
            .university(UPDATED_UNIVERSITY)
            .gymSkill(UPDATED_GYM_SKILL)
            .gymLocation(UPDATED_GYM_LOCATION)
            .gymTime(UPDATED_GYM_TIME)
            .studyTime(UPDATED_STUDY_TIME)
            .sports(UPDATED_SPORTS)
            .sportsSkill(UPDATED_SPORTS_SKILL)
            .sportsTime(UPDATED_SPORTS_TIME)
            .preferredSociety(UPDATED_PREFERRED_SOCIETY)
            .preferredEvents(UPDATED_PREFERRED_EVENTS)
            .eventsTime(UPDATED_EVENTS_TIME)
            .preferredActivities(UPDATED_PREFERRED_ACTIVITIES);

        restProfileMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedProfile.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedProfile))
            )
            .andExpect(status().isOk());

        // Validate the Profile in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertProfileUpdatableFieldsEquals(partialUpdatedProfile, getPersistedProfile(partialUpdatedProfile));
    }

    @Test
    @Transactional
    void patchNonExistingProfile() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        profile.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restProfileMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, profile.getId()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(profile))
            )
            .andExpect(status().isBadRequest());

        // Validate the Profile in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchProfile() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        profile.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restProfileMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(profile))
            )
            .andExpect(status().isBadRequest());

        // Validate the Profile in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamProfile() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        profile.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restProfileMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(profile)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Profile in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteProfile() throws Exception {
        // Initialize the database
        insertedProfile = profileRepository.saveAndFlush(profile);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the profile
        restProfileMockMvc
            .perform(delete(ENTITY_API_URL_ID, profile.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return profileRepository.count();
    }

    protected void assertIncrementedRepositoryCount(long countBefore) {
        assertThat(countBefore + 1).isEqualTo(getRepositoryCount());
    }

    protected void assertDecrementedRepositoryCount(long countBefore) {
        assertThat(countBefore - 1).isEqualTo(getRepositoryCount());
    }

    protected void assertSameRepositoryCount(long countBefore) {
        assertThat(countBefore).isEqualTo(getRepositoryCount());
    }

    protected Profile getPersistedProfile(Profile profile) {
        return profileRepository.findById(profile.getId()).orElseThrow();
    }

    protected void assertPersistedProfileToMatchAllProperties(Profile expectedProfile) {
        assertProfileAllPropertiesEquals(expectedProfile, getPersistedProfile(expectedProfile));
    }

    protected void assertPersistedProfileToMatchUpdatableProperties(Profile expectedProfile) {
        assertProfileAllUpdatablePropertiesEquals(expectedProfile, getPersistedProfile(expectedProfile));
    }
}
