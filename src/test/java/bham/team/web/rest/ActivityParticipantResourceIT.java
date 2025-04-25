package bham.team.web.rest;

import static bham.team.domain.ActivityParticipantAsserts.*;
import static bham.team.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import bham.team.IntegrationTest;
import bham.team.domain.ActivityParticipant;
import bham.team.domain.enumeration.ParticipationStatus;
import bham.team.repository.ActivityParticipantRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.time.Instant;
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
 * Integration tests for the {@link ActivityParticipantResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class ActivityParticipantResourceIT {

    private static final Instant DEFAULT_JOINED_DATE = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_JOINED_DATE = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final ParticipationStatus DEFAULT_STATUS = ParticipationStatus.PENDING;
    private static final ParticipationStatus UPDATED_STATUS = ParticipationStatus.CONFIRMED;

    private static final String ENTITY_API_URL = "/api/activity-participants";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ActivityParticipantRepository activityParticipantRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restActivityParticipantMockMvc;

    private ActivityParticipant activityParticipant;

    private ActivityParticipant insertedActivityParticipant;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ActivityParticipant createEntity() {
        return new ActivityParticipant().joinedDate(DEFAULT_JOINED_DATE).status(DEFAULT_STATUS);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ActivityParticipant createUpdatedEntity() {
        return new ActivityParticipant().joinedDate(UPDATED_JOINED_DATE).status(UPDATED_STATUS);
    }

    @BeforeEach
    public void initTest() {
        activityParticipant = createEntity();
    }

    @AfterEach
    public void cleanup() {
        if (insertedActivityParticipant != null) {
            activityParticipantRepository.delete(insertedActivityParticipant);
            insertedActivityParticipant = null;
        }
    }

    @Test
    @Transactional
    void createActivityParticipant() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the ActivityParticipant
        var returnedActivityParticipant = om.readValue(
            restActivityParticipantMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activityParticipant)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            ActivityParticipant.class
        );

        // Validate the ActivityParticipant in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertActivityParticipantUpdatableFieldsEquals(
            returnedActivityParticipant,
            getPersistedActivityParticipant(returnedActivityParticipant)
        );

        insertedActivityParticipant = returnedActivityParticipant;
    }

    @Test
    @Transactional
    void createActivityParticipantWithExistingId() throws Exception {
        // Create the ActivityParticipant with an existing ID
        activityParticipant.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restActivityParticipantMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activityParticipant)))
            .andExpect(status().isBadRequest());

        // Validate the ActivityParticipant in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkJoinedDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        activityParticipant.setJoinedDate(null);

        // Create the ActivityParticipant, which fails.

        restActivityParticipantMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activityParticipant)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkStatusIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        activityParticipant.setStatus(null);

        // Create the ActivityParticipant, which fails.

        restActivityParticipantMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activityParticipant)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllActivityParticipants() throws Exception {
        // Initialize the database
        insertedActivityParticipant = activityParticipantRepository.saveAndFlush(activityParticipant);

        // Get all the activityParticipantList
        restActivityParticipantMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(activityParticipant.getId().intValue())))
            .andExpect(jsonPath("$.[*].joinedDate").value(hasItem(DEFAULT_JOINED_DATE.toString())))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())));
    }

    @Test
    @Transactional
    void getActivityParticipant() throws Exception {
        // Initialize the database
        insertedActivityParticipant = activityParticipantRepository.saveAndFlush(activityParticipant);

        // Get the activityParticipant
        restActivityParticipantMockMvc
            .perform(get(ENTITY_API_URL_ID, activityParticipant.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(activityParticipant.getId().intValue()))
            .andExpect(jsonPath("$.joinedDate").value(DEFAULT_JOINED_DATE.toString()))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS.toString()));
    }

    @Test
    @Transactional
    void getNonExistingActivityParticipant() throws Exception {
        // Get the activityParticipant
        restActivityParticipantMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingActivityParticipant() throws Exception {
        // Initialize the database
        insertedActivityParticipant = activityParticipantRepository.saveAndFlush(activityParticipant);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the activityParticipant
        ActivityParticipant updatedActivityParticipant = activityParticipantRepository.findById(activityParticipant.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedActivityParticipant are not directly saved in db
        em.detach(updatedActivityParticipant);
        updatedActivityParticipant.joinedDate(UPDATED_JOINED_DATE).status(UPDATED_STATUS);

        restActivityParticipantMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedActivityParticipant.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedActivityParticipant))
            )
            .andExpect(status().isOk());

        // Validate the ActivityParticipant in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedActivityParticipantToMatchAllProperties(updatedActivityParticipant);
    }

    @Test
    @Transactional
    void putNonExistingActivityParticipant() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        activityParticipant.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restActivityParticipantMockMvc
            .perform(
                put(ENTITY_API_URL_ID, activityParticipant.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(activityParticipant))
            )
            .andExpect(status().isBadRequest());

        // Validate the ActivityParticipant in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchActivityParticipant() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        activityParticipant.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restActivityParticipantMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(activityParticipant))
            )
            .andExpect(status().isBadRequest());

        // Validate the ActivityParticipant in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamActivityParticipant() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        activityParticipant.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restActivityParticipantMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activityParticipant)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the ActivityParticipant in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateActivityParticipantWithPatch() throws Exception {
        // Initialize the database
        insertedActivityParticipant = activityParticipantRepository.saveAndFlush(activityParticipant);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the activityParticipant using partial update
        ActivityParticipant partialUpdatedActivityParticipant = new ActivityParticipant();
        partialUpdatedActivityParticipant.setId(activityParticipant.getId());

        partialUpdatedActivityParticipant.joinedDate(UPDATED_JOINED_DATE).status(UPDATED_STATUS);

        restActivityParticipantMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedActivityParticipant.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedActivityParticipant))
            )
            .andExpect(status().isOk());

        // Validate the ActivityParticipant in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertActivityParticipantUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedActivityParticipant, activityParticipant),
            getPersistedActivityParticipant(activityParticipant)
        );
    }

    @Test
    @Transactional
    void fullUpdateActivityParticipantWithPatch() throws Exception {
        // Initialize the database
        insertedActivityParticipant = activityParticipantRepository.saveAndFlush(activityParticipant);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the activityParticipant using partial update
        ActivityParticipant partialUpdatedActivityParticipant = new ActivityParticipant();
        partialUpdatedActivityParticipant.setId(activityParticipant.getId());

        partialUpdatedActivityParticipant.joinedDate(UPDATED_JOINED_DATE).status(UPDATED_STATUS);

        restActivityParticipantMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedActivityParticipant.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedActivityParticipant))
            )
            .andExpect(status().isOk());

        // Validate the ActivityParticipant in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertActivityParticipantUpdatableFieldsEquals(
            partialUpdatedActivityParticipant,
            getPersistedActivityParticipant(partialUpdatedActivityParticipant)
        );
    }

    @Test
    @Transactional
    void patchNonExistingActivityParticipant() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        activityParticipant.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restActivityParticipantMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, activityParticipant.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(activityParticipant))
            )
            .andExpect(status().isBadRequest());

        // Validate the ActivityParticipant in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchActivityParticipant() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        activityParticipant.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restActivityParticipantMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(activityParticipant))
            )
            .andExpect(status().isBadRequest());

        // Validate the ActivityParticipant in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamActivityParticipant() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        activityParticipant.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restActivityParticipantMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(activityParticipant)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the ActivityParticipant in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteActivityParticipant() throws Exception {
        // Initialize the database
        insertedActivityParticipant = activityParticipantRepository.saveAndFlush(activityParticipant);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the activityParticipant
        restActivityParticipantMockMvc
            .perform(delete(ENTITY_API_URL_ID, activityParticipant.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return activityParticipantRepository.count();
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

    protected ActivityParticipant getPersistedActivityParticipant(ActivityParticipant activityParticipant) {
        return activityParticipantRepository.findById(activityParticipant.getId()).orElseThrow();
    }

    protected void assertPersistedActivityParticipantToMatchAllProperties(ActivityParticipant expectedActivityParticipant) {
        assertActivityParticipantAllPropertiesEquals(
            expectedActivityParticipant,
            getPersistedActivityParticipant(expectedActivityParticipant)
        );
    }

    protected void assertPersistedActivityParticipantToMatchUpdatableProperties(ActivityParticipant expectedActivityParticipant) {
        assertActivityParticipantAllUpdatablePropertiesEquals(
            expectedActivityParticipant,
            getPersistedActivityParticipant(expectedActivityParticipant)
        );
    }
}
