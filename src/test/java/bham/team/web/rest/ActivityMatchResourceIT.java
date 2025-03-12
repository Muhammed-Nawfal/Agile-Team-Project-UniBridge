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
import bham.team.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
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

    private static final String ENTITY_API_URL = "/api/activity-matches";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ActivityMatchRepository activityMatchRepository;

    @Autowired
    private UserRepository userRepository;

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
        return new ActivityMatch().activityType(DEFAULT_ACTIVITY_TYPE).status(DEFAULT_STATUS);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ActivityMatch createUpdatedEntity() {
        return new ActivityMatch().activityType(UPDATED_ACTIVITY_TYPE).status(UPDATED_STATUS);
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
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())));
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
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS.toString()));
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
        updatedActivityMatch.activityType(UPDATED_ACTIVITY_TYPE).status(UPDATED_STATUS);

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

        partialUpdatedActivityMatch.activityType(UPDATED_ACTIVITY_TYPE).status(UPDATED_STATUS);

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
