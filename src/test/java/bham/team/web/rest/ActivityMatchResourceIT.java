package bham.team.web.rest;

import static bham.team.domain.ActivityMatchAsserts.*;
import static bham.team.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import bham.team.IntegrationTest;
import bham.team.domain.ActivityMatch;
import bham.team.domain.enumeration.ActivityType;
import bham.team.domain.enumeration.Decision;
import bham.team.repository.ActivityMatchRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
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
 * Integration tests for the {@link ActivityMatchResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class ActivityMatchResourceIT {

    private static final ActivityType DEFAULT_ACTIVITY_TYPE = ActivityType.SOCIAL;
    private static final ActivityType UPDATED_ACTIVITY_TYPE = ActivityType.ACADEMIC;

    private static final Decision DEFAULT_STATUS = Decision.ACCEPT;
    private static final Decision UPDATED_STATUS = Decision.DECLINED;

    private static final LocalDate DEFAULT_MATCH_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_MATCH_DATE = LocalDate.now(ZoneId.systemDefault());

    private static final Instant DEFAULT_MATCH_TIME = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_MATCH_TIME = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String DEFAULT_LOCATION = "AAAAAAAAAA";
    private static final String UPDATED_LOCATION = "BBBBBBBBBB";

    private static final String DEFAULT_NOTES = "AAAAAAAAAA";
    private static final String UPDATED_NOTES = "BBBBBBBBBB";

    private static final Instant DEFAULT_CREATED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CREATED_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Instant DEFAULT_RESPONSE_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_RESPONSE_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/activity-matches";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ActivityMatchRepository activityMatchRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restActivityMatchMockMvc;

    private ActivityMatch activityMatch;

    private ActivityMatch insertedActivityMatch;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ActivityMatch createEntity() {
        return new ActivityMatch()
            .activityType(DEFAULT_ACTIVITY_TYPE)
            .status(DEFAULT_STATUS)
            .matchDate(DEFAULT_MATCH_DATE)
            .matchTime(DEFAULT_MATCH_TIME)
            .location(DEFAULT_LOCATION)
            .notes(DEFAULT_NOTES)
            .createdAt(DEFAULT_CREATED_AT)
            .responseAt(DEFAULT_RESPONSE_AT);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ActivityMatch createUpdatedEntity() {
        return new ActivityMatch()
            .activityType(UPDATED_ACTIVITY_TYPE)
            .status(UPDATED_STATUS)
            .matchDate(UPDATED_MATCH_DATE)
            .matchTime(UPDATED_MATCH_TIME)
            .location(UPDATED_LOCATION)
            .notes(UPDATED_NOTES)
            .createdAt(UPDATED_CREATED_AT)
            .responseAt(UPDATED_RESPONSE_AT);
    }

    @BeforeEach
    public void initTest() {
        activityMatch = createEntity();
    }

    @AfterEach
    public void cleanup() {
        if (insertedActivityMatch != null) {
            activityMatchRepository.delete(insertedActivityMatch);
            insertedActivityMatch = null;
        }
    }

    @Test
    @Transactional
    void createActivityMatch() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the ActivityMatch
        var returnedActivityMatch = om.readValue(
            restActivityMatchMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activityMatch)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            ActivityMatch.class
        );

        // Validate the ActivityMatch in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertActivityMatchUpdatableFieldsEquals(returnedActivityMatch, getPersistedActivityMatch(returnedActivityMatch));

        insertedActivityMatch = returnedActivityMatch;
    }

    @Test
    @Transactional
    void createActivityMatchWithExistingId() throws Exception {
        // Create the ActivityMatch with an existing ID
        activityMatch.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restActivityMatchMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activityMatch)))
            .andExpect(status().isBadRequest());

        // Validate the ActivityMatch in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkActivityTypeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        activityMatch.setActivityType(null);

        // Create the ActivityMatch, which fails.

        restActivityMatchMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activityMatch)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkStatusIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        activityMatch.setStatus(null);

        // Create the ActivityMatch, which fails.

        restActivityMatchMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activityMatch)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkMatchDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        activityMatch.setMatchDate(null);

        // Create the ActivityMatch, which fails.

        restActivityMatchMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activityMatch)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkMatchTimeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        activityMatch.setMatchTime(null);

        // Create the ActivityMatch, which fails.

        restActivityMatchMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activityMatch)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCreatedAtIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        activityMatch.setCreatedAt(null);

        // Create the ActivityMatch, which fails.

        restActivityMatchMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activityMatch)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkResponseAtIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        activityMatch.setResponseAt(null);

        // Create the ActivityMatch, which fails.

        restActivityMatchMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activityMatch)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllActivityMatches() throws Exception {
        // Initialize the database
        insertedActivityMatch = activityMatchRepository.saveAndFlush(activityMatch);

        // Get all the activityMatchList
        restActivityMatchMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(activityMatch.getId().intValue())))
            .andExpect(jsonPath("$.[*].activityType").value(hasItem(DEFAULT_ACTIVITY_TYPE.toString())))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())))
            .andExpect(jsonPath("$.[*].matchDate").value(hasItem(DEFAULT_MATCH_DATE.toString())))
            .andExpect(jsonPath("$.[*].matchTime").value(hasItem(DEFAULT_MATCH_TIME.toString())))
            .andExpect(jsonPath("$.[*].location").value(hasItem(DEFAULT_LOCATION)))
            .andExpect(jsonPath("$.[*].notes").value(hasItem(DEFAULT_NOTES.toString())))
            .andExpect(jsonPath("$.[*].createdAt").value(hasItem(DEFAULT_CREATED_AT.toString())))
            .andExpect(jsonPath("$.[*].responseAt").value(hasItem(DEFAULT_RESPONSE_AT.toString())));
    }

    @Test
    @Transactional
    void getActivityMatch() throws Exception {
        // Initialize the database
        insertedActivityMatch = activityMatchRepository.saveAndFlush(activityMatch);

        // Get the activityMatch
        restActivityMatchMockMvc
            .perform(get(ENTITY_API_URL_ID, activityMatch.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(activityMatch.getId().intValue()))
            .andExpect(jsonPath("$.activityType").value(DEFAULT_ACTIVITY_TYPE.toString()))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS.toString()))
            .andExpect(jsonPath("$.matchDate").value(DEFAULT_MATCH_DATE.toString()))
            .andExpect(jsonPath("$.matchTime").value(DEFAULT_MATCH_TIME.toString()))
            .andExpect(jsonPath("$.location").value(DEFAULT_LOCATION))
            .andExpect(jsonPath("$.notes").value(DEFAULT_NOTES.toString()))
            .andExpect(jsonPath("$.createdAt").value(DEFAULT_CREATED_AT.toString()))
            .andExpect(jsonPath("$.responseAt").value(DEFAULT_RESPONSE_AT.toString()));
    }

    @Test
    @Transactional
    void getNonExistingActivityMatch() throws Exception {
        // Get the activityMatch
        restActivityMatchMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingActivityMatch() throws Exception {
        // Initialize the database
        insertedActivityMatch = activityMatchRepository.saveAndFlush(activityMatch);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the activityMatch
        ActivityMatch updatedActivityMatch = activityMatchRepository.findById(activityMatch.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedActivityMatch are not directly saved in db
        em.detach(updatedActivityMatch);
        updatedActivityMatch
            .activityType(UPDATED_ACTIVITY_TYPE)
            .status(UPDATED_STATUS)
            .matchDate(UPDATED_MATCH_DATE)
            .matchTime(UPDATED_MATCH_TIME)
            .location(UPDATED_LOCATION)
            .notes(UPDATED_NOTES)
            .createdAt(UPDATED_CREATED_AT)
            .responseAt(UPDATED_RESPONSE_AT);

        restActivityMatchMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedActivityMatch.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedActivityMatch))
            )
            .andExpect(status().isOk());

        // Validate the ActivityMatch in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedActivityMatchToMatchAllProperties(updatedActivityMatch);
    }

    @Test
    @Transactional
    void putNonExistingActivityMatch() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        activityMatch.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restActivityMatchMockMvc
            .perform(
                put(ENTITY_API_URL_ID, activityMatch.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(activityMatch))
            )
            .andExpect(status().isBadRequest());

        // Validate the ActivityMatch in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchActivityMatch() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        activityMatch.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restActivityMatchMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(activityMatch))
            )
            .andExpect(status().isBadRequest());

        // Validate the ActivityMatch in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamActivityMatch() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        activityMatch.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restActivityMatchMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activityMatch)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the ActivityMatch in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateActivityMatchWithPatch() throws Exception {
        // Initialize the database
        insertedActivityMatch = activityMatchRepository.saveAndFlush(activityMatch);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the activityMatch using partial update
        ActivityMatch partialUpdatedActivityMatch = new ActivityMatch();
        partialUpdatedActivityMatch.setId(activityMatch.getId());

        partialUpdatedActivityMatch.status(UPDATED_STATUS).notes(UPDATED_NOTES).responseAt(UPDATED_RESPONSE_AT);

        restActivityMatchMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedActivityMatch.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedActivityMatch))
            )
            .andExpect(status().isOk());

        // Validate the ActivityMatch in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertActivityMatchUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedActivityMatch, activityMatch),
            getPersistedActivityMatch(activityMatch)
        );
    }

    @Test
    @Transactional
    void fullUpdateActivityMatchWithPatch() throws Exception {
        // Initialize the database
        insertedActivityMatch = activityMatchRepository.saveAndFlush(activityMatch);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the activityMatch using partial update
        ActivityMatch partialUpdatedActivityMatch = new ActivityMatch();
        partialUpdatedActivityMatch.setId(activityMatch.getId());

        partialUpdatedActivityMatch
            .activityType(UPDATED_ACTIVITY_TYPE)
            .status(UPDATED_STATUS)
            .matchDate(UPDATED_MATCH_DATE)
            .matchTime(UPDATED_MATCH_TIME)
            .location(UPDATED_LOCATION)
            .notes(UPDATED_NOTES)
            .createdAt(UPDATED_CREATED_AT)
            .responseAt(UPDATED_RESPONSE_AT);

        restActivityMatchMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedActivityMatch.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedActivityMatch))
            )
            .andExpect(status().isOk());

        // Validate the ActivityMatch in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertActivityMatchUpdatableFieldsEquals(partialUpdatedActivityMatch, getPersistedActivityMatch(partialUpdatedActivityMatch));
    }

    @Test
    @Transactional
    void patchNonExistingActivityMatch() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        activityMatch.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restActivityMatchMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, activityMatch.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(activityMatch))
            )
            .andExpect(status().isBadRequest());

        // Validate the ActivityMatch in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchActivityMatch() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        activityMatch.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restActivityMatchMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(activityMatch))
            )
            .andExpect(status().isBadRequest());

        // Validate the ActivityMatch in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamActivityMatch() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        activityMatch.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restActivityMatchMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(activityMatch)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the ActivityMatch in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteActivityMatch() throws Exception {
        // Initialize the database
        insertedActivityMatch = activityMatchRepository.saveAndFlush(activityMatch);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the activityMatch
        restActivityMatchMockMvc
            .perform(delete(ENTITY_API_URL_ID, activityMatch.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return activityMatchRepository.count();
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

    protected ActivityMatch getPersistedActivityMatch(ActivityMatch activityMatch) {
        return activityMatchRepository.findById(activityMatch.getId()).orElseThrow();
    }

    protected void assertPersistedActivityMatchToMatchAllProperties(ActivityMatch expectedActivityMatch) {
        assertActivityMatchAllPropertiesEquals(expectedActivityMatch, getPersistedActivityMatch(expectedActivityMatch));
    }

    protected void assertPersistedActivityMatchToMatchUpdatableProperties(ActivityMatch expectedActivityMatch) {
        assertActivityMatchAllUpdatablePropertiesEquals(expectedActivityMatch, getPersistedActivityMatch(expectedActivityMatch));
    }
}
