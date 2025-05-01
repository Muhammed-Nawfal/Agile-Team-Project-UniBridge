package bham.team.web.rest;

import static bham.team.domain.ActivityAsserts.*;
import static bham.team.web.rest.TestUtil.createUpdateProxyForBean;
import static bham.team.web.rest.TestUtil.sameNumber;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import bham.team.IntegrationTest;
import bham.team.domain.Activity;
import bham.team.domain.enumeration.ActivityType;
import bham.team.domain.enumeration.Status;
import bham.team.repository.ActivityRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
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
 * Integration tests for the {@link ActivityResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class ActivityResourceIT {

    private static final String DEFAULT_ACTIVITY_NAME = "AAAAAAAAAA";
    private static final String UPDATED_ACTIVITY_NAME = "BBBBBBBBBB";

    private static final ActivityType DEFAULT_ACTIVITY_TYPE = ActivityType.SOCIAL;
    private static final ActivityType UPDATED_ACTIVITY_TYPE = ActivityType.ACADEMIC;

    private static final Instant DEFAULT_ACTIVITY_DATE = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_ACTIVITY_DATE = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Integer DEFAULT_NUMBER_OF_PARTICIPANTS = 1;
    private static final Integer UPDATED_NUMBER_OF_PARTICIPANTS = 2;

    private static final Integer DEFAULT_MAX_NUMBER_OF_PARTICIPANTS = 2;
    private static final Integer UPDATED_MAX_NUMBER_OF_PARTICIPANTS = 3;

    private static final String DEFAULT_LOCATION = "AAAAAAAAAA";
    private static final String UPDATED_LOCATION = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final Instant DEFAULT_CREATED_ON = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CREATED_ON = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Instant DEFAULT_UPDATED_ON = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_UPDATED_ON = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Status DEFAULT_STATUS = Status.ANNOUNCED;
    private static final Status UPDATED_STATUS = Status.CURRENTLY_HAPPENING;

    private static final byte[] DEFAULT_COVER_IMAGE = TestUtil.createByteArray(1, "0");
    private static final byte[] UPDATED_COVER_IMAGE = TestUtil.createByteArray(1, "1");
    private static final String DEFAULT_COVER_IMAGE_CONTENT_TYPE = "image/jpg";
    private static final String UPDATED_COVER_IMAGE_CONTENT_TYPE = "image/png";

    private static final Boolean DEFAULT_IS_PAID = false;
    private static final Boolean UPDATED_IS_PAID = true;

    private static final BigDecimal DEFAULT_ACTIVITY_COST = new BigDecimal(0);
    private static final BigDecimal UPDATED_ACTIVITY_COST = new BigDecimal(1);

    private static final String ENTITY_API_URL = "/api/activities";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restActivityMockMvc;

    private Activity activity;

    private Activity insertedActivity;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Activity createEntity() {
        return new Activity()
            .activityName(DEFAULT_ACTIVITY_NAME)
            .activityType(DEFAULT_ACTIVITY_TYPE)
            .activityDate(DEFAULT_ACTIVITY_DATE)
            .numberOfParticipants(DEFAULT_NUMBER_OF_PARTICIPANTS)
            .maxNumberOfParticipants(DEFAULT_MAX_NUMBER_OF_PARTICIPANTS)
            .location(DEFAULT_LOCATION)
            .description(DEFAULT_DESCRIPTION)
            .createdOn(DEFAULT_CREATED_ON)
            .updatedOn(DEFAULT_UPDATED_ON)
            .status(DEFAULT_STATUS)
            .coverImage(DEFAULT_COVER_IMAGE)
            .coverImageContentType(DEFAULT_COVER_IMAGE_CONTENT_TYPE)
            .isPaid(DEFAULT_IS_PAID)
            .activityCost(DEFAULT_ACTIVITY_COST);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Activity createUpdatedEntity() {
        return new Activity()
            .activityName(UPDATED_ACTIVITY_NAME)
            .activityType(UPDATED_ACTIVITY_TYPE)
            .activityDate(UPDATED_ACTIVITY_DATE)
            .numberOfParticipants(UPDATED_NUMBER_OF_PARTICIPANTS)
            .maxNumberOfParticipants(UPDATED_MAX_NUMBER_OF_PARTICIPANTS)
            .location(UPDATED_LOCATION)
            .description(UPDATED_DESCRIPTION)
            .createdOn(UPDATED_CREATED_ON)
            .updatedOn(UPDATED_UPDATED_ON)
            .status(UPDATED_STATUS)
            .coverImage(UPDATED_COVER_IMAGE)
            .coverImageContentType(UPDATED_COVER_IMAGE_CONTENT_TYPE)
            .isPaid(UPDATED_IS_PAID)
            .activityCost(UPDATED_ACTIVITY_COST);
    }

    @BeforeEach
    public void initTest() {
        activity = createEntity();
    }

    @AfterEach
    public void cleanup() {
        if (insertedActivity != null) {
            activityRepository.delete(insertedActivity);
            insertedActivity = null;
        }
    }

    @Test
    @Transactional
    void createActivity() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Activity
        var returnedActivity = om.readValue(
            restActivityMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activity)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            Activity.class
        );

        // Validate the Activity in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertActivityUpdatableFieldsEquals(returnedActivity, getPersistedActivity(returnedActivity));

        insertedActivity = returnedActivity;
    }

    @Test
    @Transactional
    void createActivityWithExistingId() throws Exception {
        // Create the Activity with an existing ID
        activity.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restActivityMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activity)))
            .andExpect(status().isBadRequest());

        // Validate the Activity in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkActivityNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        activity.setActivityName(null);

        // Create the Activity, which fails.

        restActivityMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activity)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkActivityTypeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        activity.setActivityType(null);

        // Create the Activity, which fails.

        restActivityMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activity)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkActivityDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        activity.setActivityDate(null);

        // Create the Activity, which fails.

        restActivityMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activity)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkNumberOfParticipantsIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        activity.setNumberOfParticipants(null);

        // Create the Activity, which fails.

        restActivityMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activity)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkMaxNumberOfParticipantsIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        activity.setMaxNumberOfParticipants(null);

        // Create the Activity, which fails.

        restActivityMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activity)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkLocationIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        activity.setLocation(null);

        // Create the Activity, which fails.

        restActivityMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activity)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCreatedOnIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        activity.setCreatedOn(null);

        // Create the Activity, which fails.

        restActivityMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activity)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkUpdatedOnIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        activity.setUpdatedOn(null);

        // Create the Activity, which fails.

        restActivityMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activity)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkStatusIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        activity.setStatus(null);

        // Create the Activity, which fails.

        restActivityMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activity)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkIsPaidIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        activity.setIsPaid(null);

        // Create the Activity, which fails.

        restActivityMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activity)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkActivityCostIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        activity.setActivityCost(null);

        // Create the Activity, which fails.

        restActivityMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activity)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllActivities() throws Exception {
        // Initialize the database
        insertedActivity = activityRepository.saveAndFlush(activity);

        // Get all the activityList
        restActivityMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(activity.getId().intValue())))
            .andExpect(jsonPath("$.[*].activityName").value(hasItem(DEFAULT_ACTIVITY_NAME)))
            .andExpect(jsonPath("$.[*].activityType").value(hasItem(DEFAULT_ACTIVITY_TYPE.toString())))
            .andExpect(jsonPath("$.[*].activityDate").value(hasItem(DEFAULT_ACTIVITY_DATE.toString())))
            .andExpect(jsonPath("$.[*].numberOfParticipants").value(hasItem(DEFAULT_NUMBER_OF_PARTICIPANTS)))
            .andExpect(jsonPath("$.[*].maxNumberOfParticipants").value(hasItem(DEFAULT_MAX_NUMBER_OF_PARTICIPANTS)))
            .andExpect(jsonPath("$.[*].location").value(hasItem(DEFAULT_LOCATION)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())))
            .andExpect(jsonPath("$.[*].createdOn").value(hasItem(DEFAULT_CREATED_ON.toString())))
            .andExpect(jsonPath("$.[*].updatedOn").value(hasItem(DEFAULT_UPDATED_ON.toString())))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())))
            .andExpect(jsonPath("$.[*].coverImageContentType").value(hasItem(DEFAULT_COVER_IMAGE_CONTENT_TYPE)))
            .andExpect(jsonPath("$.[*].coverImage").value(hasItem(Base64.getEncoder().encodeToString(DEFAULT_COVER_IMAGE))))
            .andExpect(jsonPath("$.[*].isPaid").value(hasItem(DEFAULT_IS_PAID.booleanValue())))
            .andExpect(jsonPath("$.[*].activityCost").value(hasItem(sameNumber(DEFAULT_ACTIVITY_COST))));
    }

    @Test
    @Transactional
    void getActivity() throws Exception {
        // Initialize the database
        insertedActivity = activityRepository.saveAndFlush(activity);

        // Get the activity
        restActivityMockMvc
            .perform(get(ENTITY_API_URL_ID, activity.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(activity.getId().intValue()))
            .andExpect(jsonPath("$.activityName").value(DEFAULT_ACTIVITY_NAME))
            .andExpect(jsonPath("$.activityType").value(DEFAULT_ACTIVITY_TYPE.toString()))
            .andExpect(jsonPath("$.activityDate").value(DEFAULT_ACTIVITY_DATE.toString()))
            .andExpect(jsonPath("$.numberOfParticipants").value(DEFAULT_NUMBER_OF_PARTICIPANTS))
            .andExpect(jsonPath("$.maxNumberOfParticipants").value(DEFAULT_MAX_NUMBER_OF_PARTICIPANTS))
            .andExpect(jsonPath("$.location").value(DEFAULT_LOCATION))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()))
            .andExpect(jsonPath("$.createdOn").value(DEFAULT_CREATED_ON.toString()))
            .andExpect(jsonPath("$.updatedOn").value(DEFAULT_UPDATED_ON.toString()))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS.toString()))
            .andExpect(jsonPath("$.coverImageContentType").value(DEFAULT_COVER_IMAGE_CONTENT_TYPE))
            .andExpect(jsonPath("$.coverImage").value(Base64.getEncoder().encodeToString(DEFAULT_COVER_IMAGE)))
            .andExpect(jsonPath("$.isPaid").value(DEFAULT_IS_PAID.booleanValue()))
            .andExpect(jsonPath("$.activityCost").value(sameNumber(DEFAULT_ACTIVITY_COST)));
    }

    @Test
    @Transactional
    void getNonExistingActivity() throws Exception {
        // Get the activity
        restActivityMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingActivity() throws Exception {
        // Initialize the database
        insertedActivity = activityRepository.saveAndFlush(activity);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the activity
        Activity updatedActivity = activityRepository.findById(activity.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedActivity are not directly saved in db
        em.detach(updatedActivity);
        updatedActivity
            .activityName(UPDATED_ACTIVITY_NAME)
            .activityType(UPDATED_ACTIVITY_TYPE)
            .activityDate(UPDATED_ACTIVITY_DATE)
            .numberOfParticipants(UPDATED_NUMBER_OF_PARTICIPANTS)
            .maxNumberOfParticipants(UPDATED_MAX_NUMBER_OF_PARTICIPANTS)
            .location(UPDATED_LOCATION)
            .description(UPDATED_DESCRIPTION)
            .createdOn(UPDATED_CREATED_ON)
            .updatedOn(UPDATED_UPDATED_ON)
            .status(UPDATED_STATUS)
            .coverImage(UPDATED_COVER_IMAGE)
            .coverImageContentType(UPDATED_COVER_IMAGE_CONTENT_TYPE)
            .isPaid(UPDATED_IS_PAID)
            .activityCost(UPDATED_ACTIVITY_COST);

        restActivityMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedActivity.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedActivity))
            )
            .andExpect(status().isOk());

        // Validate the Activity in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedActivityToMatchAllProperties(updatedActivity);
    }

    @Test
    @Transactional
    void putNonExistingActivity() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        activity.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restActivityMockMvc
            .perform(
                put(ENTITY_API_URL_ID, activity.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activity))
            )
            .andExpect(status().isBadRequest());

        // Validate the Activity in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchActivity() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        activity.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restActivityMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(activity))
            )
            .andExpect(status().isBadRequest());

        // Validate the Activity in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamActivity() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        activity.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restActivityMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activity)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Activity in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateActivityWithPatch() throws Exception {
        // Initialize the database
        insertedActivity = activityRepository.saveAndFlush(activity);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the activity using partial update
        Activity partialUpdatedActivity = new Activity();
        partialUpdatedActivity.setId(activity.getId());

        partialUpdatedActivity
            .activityName(UPDATED_ACTIVITY_NAME)
            .activityDate(UPDATED_ACTIVITY_DATE)
            .numberOfParticipants(UPDATED_NUMBER_OF_PARTICIPANTS);

        restActivityMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedActivity.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedActivity))
            )
            .andExpect(status().isOk());

        // Validate the Activity in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertActivityUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedActivity, activity), getPersistedActivity(activity));
    }

    @Test
    @Transactional
    void fullUpdateActivityWithPatch() throws Exception {
        // Initialize the database
        insertedActivity = activityRepository.saveAndFlush(activity);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the activity using partial update
        Activity partialUpdatedActivity = new Activity();
        partialUpdatedActivity.setId(activity.getId());

        partialUpdatedActivity
            .activityName(UPDATED_ACTIVITY_NAME)
            .activityType(UPDATED_ACTIVITY_TYPE)
            .activityDate(UPDATED_ACTIVITY_DATE)
            .numberOfParticipants(UPDATED_NUMBER_OF_PARTICIPANTS)
            .maxNumberOfParticipants(UPDATED_MAX_NUMBER_OF_PARTICIPANTS)
            .location(UPDATED_LOCATION)
            .description(UPDATED_DESCRIPTION)
            .createdOn(UPDATED_CREATED_ON)
            .updatedOn(UPDATED_UPDATED_ON)
            .status(UPDATED_STATUS)
            .coverImage(UPDATED_COVER_IMAGE)
            .coverImageContentType(UPDATED_COVER_IMAGE_CONTENT_TYPE)
            .isPaid(UPDATED_IS_PAID)
            .activityCost(UPDATED_ACTIVITY_COST);

        restActivityMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedActivity.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedActivity))
            )
            .andExpect(status().isOk());

        // Validate the Activity in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertActivityUpdatableFieldsEquals(partialUpdatedActivity, getPersistedActivity(partialUpdatedActivity));
    }

    @Test
    @Transactional
    void patchNonExistingActivity() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        activity.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restActivityMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, activity.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(activity))
            )
            .andExpect(status().isBadRequest());

        // Validate the Activity in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchActivity() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        activity.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restActivityMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(activity))
            )
            .andExpect(status().isBadRequest());

        // Validate the Activity in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamActivity() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        activity.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restActivityMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(activity)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Activity in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteActivity() throws Exception {
        // Initialize the database
        insertedActivity = activityRepository.saveAndFlush(activity);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the activity
        restActivityMockMvc
            .perform(delete(ENTITY_API_URL_ID, activity.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return activityRepository.count();
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

    protected Activity getPersistedActivity(Activity activity) {
        return activityRepository.findById(activity.getId()).orElseThrow();
    }

    protected void assertPersistedActivityToMatchAllProperties(Activity expectedActivity) {
        assertActivityAllPropertiesEquals(expectedActivity, getPersistedActivity(expectedActivity));
    }

    protected void assertPersistedActivityToMatchUpdatableProperties(Activity expectedActivity) {
        assertActivityAllUpdatablePropertiesEquals(expectedActivity, getPersistedActivity(expectedActivity));
    }
}
