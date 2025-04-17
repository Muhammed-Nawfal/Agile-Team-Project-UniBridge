package bham.team.web.rest;

import static bham.team.domain.ActionAsserts.*;
import static bham.team.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import bham.team.IntegrationTest;
import bham.team.domain.Action;
import bham.team.domain.enumeration.ActionType;
import bham.team.repository.ActionRepository;
import bham.team.repository.UserRepository;
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
 * Integration tests for the {@link ActionResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class ActionResourceIT {

    private static final ActionType DEFAULT_TYPE = ActionType.UNMATCH;
    private static final ActionType UPDATED_TYPE = ActionType.REPORT;

    private static final Instant DEFAULT_TIMESTAMP = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_TIMESTAMP = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/actions";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ActionRepository actionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restActionMockMvc;

    private Action action;

    private Action insertedAction;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Action createEntity() {
        return new Action().type(DEFAULT_TYPE).timestamp(DEFAULT_TIMESTAMP);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Action createUpdatedEntity() {
        return new Action().type(UPDATED_TYPE).timestamp(UPDATED_TIMESTAMP);
    }

    @BeforeEach
    public void initTest() {
        action = createEntity();
    }

    @AfterEach
    public void cleanup() {
        if (insertedAction != null) {
            actionRepository.delete(insertedAction);
            insertedAction = null;
        }
    }

    @Test
    @Transactional
    void createAction() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Action
        var returnedAction = om.readValue(
            restActionMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(action)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            Action.class
        );

        // Validate the Action in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertActionUpdatableFieldsEquals(returnedAction, getPersistedAction(returnedAction));

        insertedAction = returnedAction;
    }

    @Test
    @Transactional
    void createActionWithExistingId() throws Exception {
        // Create the Action with an existing ID
        action.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restActionMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(action)))
            .andExpect(status().isBadRequest());

        // Validate the Action in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTypeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        action.setType(null);

        // Create the Action, which fails.

        restActionMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(action)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTimestampIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        action.setTimestamp(null);

        // Create the Action, which fails.

        restActionMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(action)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllActions() throws Exception {
        // Initialize the database
        insertedAction = actionRepository.saveAndFlush(action);

        // Get all the actionList
        restActionMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(action.getId().intValue())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].timestamp").value(hasItem(DEFAULT_TIMESTAMP.toString())));
    }

    @Test
    @Transactional
    void getAction() throws Exception {
        // Initialize the database
        insertedAction = actionRepository.saveAndFlush(action);

        // Get the action
        restActionMockMvc
            .perform(get(ENTITY_API_URL_ID, action.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(action.getId().intValue()))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE.toString()))
            .andExpect(jsonPath("$.timestamp").value(DEFAULT_TIMESTAMP.toString()));
    }

    @Test
    @Transactional
    void getNonExistingAction() throws Exception {
        // Get the action
        restActionMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingAction() throws Exception {
        // Initialize the database
        insertedAction = actionRepository.saveAndFlush(action);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the action
        Action updatedAction = actionRepository.findById(action.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedAction are not directly saved in db
        em.detach(updatedAction);
        updatedAction.type(UPDATED_TYPE).timestamp(UPDATED_TIMESTAMP);

        restActionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedAction.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedAction))
            )
            .andExpect(status().isOk());

        // Validate the Action in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedActionToMatchAllProperties(updatedAction);
    }

    @Test
    @Transactional
    void putNonExistingAction() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        action.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restActionMockMvc
            .perform(put(ENTITY_API_URL_ID, action.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(action)))
            .andExpect(status().isBadRequest());

        // Validate the Action in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchAction() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        action.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restActionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(action))
            )
            .andExpect(status().isBadRequest());

        // Validate the Action in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamAction() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        action.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restActionMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(action)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Action in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateActionWithPatch() throws Exception {
        // Initialize the database
        insertedAction = actionRepository.saveAndFlush(action);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the action using partial update
        Action partialUpdatedAction = new Action();
        partialUpdatedAction.setId(action.getId());

        partialUpdatedAction.type(UPDATED_TYPE).timestamp(UPDATED_TIMESTAMP);

        restActionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedAction.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedAction))
            )
            .andExpect(status().isOk());

        // Validate the Action in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertActionUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedAction, action), getPersistedAction(action));
    }

    @Test
    @Transactional
    void fullUpdateActionWithPatch() throws Exception {
        // Initialize the database
        insertedAction = actionRepository.saveAndFlush(action);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the action using partial update
        Action partialUpdatedAction = new Action();
        partialUpdatedAction.setId(action.getId());

        partialUpdatedAction.type(UPDATED_TYPE).timestamp(UPDATED_TIMESTAMP);

        restActionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedAction.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedAction))
            )
            .andExpect(status().isOk());

        // Validate the Action in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertActionUpdatableFieldsEquals(partialUpdatedAction, getPersistedAction(partialUpdatedAction));
    }

    @Test
    @Transactional
    void patchNonExistingAction() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        action.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restActionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, action.getId()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(action))
            )
            .andExpect(status().isBadRequest());

        // Validate the Action in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchAction() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        action.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restActionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(action))
            )
            .andExpect(status().isBadRequest());

        // Validate the Action in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamAction() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        action.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restActionMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(action)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Action in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteAction() throws Exception {
        // Initialize the database
        insertedAction = actionRepository.saveAndFlush(action);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the action
        restActionMockMvc
            .perform(delete(ENTITY_API_URL_ID, action.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return actionRepository.count();
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

    protected Action getPersistedAction(Action action) {
        return actionRepository.findById(action.getId()).orElseThrow();
    }

    protected void assertPersistedActionToMatchAllProperties(Action expectedAction) {
        assertActionAllPropertiesEquals(expectedAction, getPersistedAction(expectedAction));
    }

    protected void assertPersistedActionToMatchUpdatableProperties(Action expectedAction) {
        assertActionAllUpdatablePropertiesEquals(expectedAction, getPersistedAction(expectedAction));
    }
}
