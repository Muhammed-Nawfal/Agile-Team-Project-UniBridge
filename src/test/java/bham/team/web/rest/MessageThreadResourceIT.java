package bham.team.web.rest;

import static bham.team.domain.MessageThreadAsserts.*;
import static bham.team.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import bham.team.IntegrationTest;
import bham.team.domain.MessageThread;
import bham.team.repository.MessageThreadRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link MessageThreadResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class MessageThreadResourceIT {

    private static final Boolean DEFAULT_IS_GROUP = false;
    private static final Boolean UPDATED_IS_GROUP = true;

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final Instant DEFAULT_CREATED_ON = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CREATED_ON = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Instant DEFAULT_UPDATED_ON = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_UPDATED_ON = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/message-threads";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private MessageThreadRepository messageThreadRepository;

    @Mock
    private MessageThreadRepository messageThreadRepositoryMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restMessageThreadMockMvc;

    private MessageThread messageThread;

    private MessageThread insertedMessageThread;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static MessageThread createEntity() {
        return new MessageThread().isGroup(DEFAULT_IS_GROUP).name(DEFAULT_NAME).createdOn(DEFAULT_CREATED_ON).updatedOn(DEFAULT_UPDATED_ON);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static MessageThread createUpdatedEntity() {
        return new MessageThread().isGroup(UPDATED_IS_GROUP).name(UPDATED_NAME).createdOn(UPDATED_CREATED_ON).updatedOn(UPDATED_UPDATED_ON);
    }

    @BeforeEach
    public void initTest() {
        messageThread = createEntity();
    }

    @AfterEach
    public void cleanup() {
        if (insertedMessageThread != null) {
            messageThreadRepository.delete(insertedMessageThread);
            insertedMessageThread = null;
        }
    }

    @Test
    @Transactional
    void createMessageThread() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the MessageThread
        var returnedMessageThread = om.readValue(
            restMessageThreadMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(messageThread)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            MessageThread.class
        );

        // Validate the MessageThread in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertMessageThreadUpdatableFieldsEquals(returnedMessageThread, getPersistedMessageThread(returnedMessageThread));

        insertedMessageThread = returnedMessageThread;
    }

    @Test
    @Transactional
    void createMessageThreadWithExistingId() throws Exception {
        // Create the MessageThread with an existing ID
        messageThread.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restMessageThreadMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(messageThread)))
            .andExpect(status().isBadRequest());

        // Validate the MessageThread in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkIsGroupIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        messageThread.setIsGroup(null);

        // Create the MessageThread, which fails.

        restMessageThreadMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(messageThread)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCreatedOnIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        messageThread.setCreatedOn(null);

        // Create the MessageThread, which fails.

        restMessageThreadMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(messageThread)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllMessageThreads() throws Exception {
        // Initialize the database
        insertedMessageThread = messageThreadRepository.saveAndFlush(messageThread);

        // Get all the messageThreadList
        restMessageThreadMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(messageThread.getId().intValue())))
            .andExpect(jsonPath("$.[*].isGroup").value(hasItem(DEFAULT_IS_GROUP.booleanValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].createdOn").value(hasItem(DEFAULT_CREATED_ON.toString())))
            .andExpect(jsonPath("$.[*].updatedOn").value(hasItem(DEFAULT_UPDATED_ON.toString())));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllMessageThreadsWithEagerRelationshipsIsEnabled() throws Exception {
        when(messageThreadRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restMessageThreadMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(messageThreadRepositoryMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllMessageThreadsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(messageThreadRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restMessageThreadMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(messageThreadRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getMessageThread() throws Exception {
        // Initialize the database
        insertedMessageThread = messageThreadRepository.saveAndFlush(messageThread);

        // Get the messageThread
        restMessageThreadMockMvc
            .perform(get(ENTITY_API_URL_ID, messageThread.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(messageThread.getId().intValue()))
            .andExpect(jsonPath("$.isGroup").value(DEFAULT_IS_GROUP.booleanValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.createdOn").value(DEFAULT_CREATED_ON.toString()))
            .andExpect(jsonPath("$.updatedOn").value(DEFAULT_UPDATED_ON.toString()));
    }

    @Test
    @Transactional
    void getNonExistingMessageThread() throws Exception {
        // Get the messageThread
        restMessageThreadMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingMessageThread() throws Exception {
        // Initialize the database
        insertedMessageThread = messageThreadRepository.saveAndFlush(messageThread);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the messageThread
        MessageThread updatedMessageThread = messageThreadRepository.findById(messageThread.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedMessageThread are not directly saved in db
        em.detach(updatedMessageThread);
        updatedMessageThread.isGroup(UPDATED_IS_GROUP).name(UPDATED_NAME).createdOn(UPDATED_CREATED_ON).updatedOn(UPDATED_UPDATED_ON);

        restMessageThreadMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedMessageThread.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedMessageThread))
            )
            .andExpect(status().isOk());

        // Validate the MessageThread in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedMessageThreadToMatchAllProperties(updatedMessageThread);
    }

    @Test
    @Transactional
    void putNonExistingMessageThread() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        messageThread.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restMessageThreadMockMvc
            .perform(
                put(ENTITY_API_URL_ID, messageThread.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(messageThread))
            )
            .andExpect(status().isBadRequest());

        // Validate the MessageThread in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchMessageThread() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        messageThread.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restMessageThreadMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(messageThread))
            )
            .andExpect(status().isBadRequest());

        // Validate the MessageThread in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamMessageThread() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        messageThread.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restMessageThreadMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(messageThread)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the MessageThread in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateMessageThreadWithPatch() throws Exception {
        // Initialize the database
        insertedMessageThread = messageThreadRepository.saveAndFlush(messageThread);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the messageThread using partial update
        MessageThread partialUpdatedMessageThread = new MessageThread();
        partialUpdatedMessageThread.setId(messageThread.getId());

        partialUpdatedMessageThread.updatedOn(UPDATED_UPDATED_ON);

        restMessageThreadMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedMessageThread.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedMessageThread))
            )
            .andExpect(status().isOk());

        // Validate the MessageThread in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertMessageThreadUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedMessageThread, messageThread),
            getPersistedMessageThread(messageThread)
        );
    }

    @Test
    @Transactional
    void fullUpdateMessageThreadWithPatch() throws Exception {
        // Initialize the database
        insertedMessageThread = messageThreadRepository.saveAndFlush(messageThread);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the messageThread using partial update
        MessageThread partialUpdatedMessageThread = new MessageThread();
        partialUpdatedMessageThread.setId(messageThread.getId());

        partialUpdatedMessageThread
            .isGroup(UPDATED_IS_GROUP)
            .name(UPDATED_NAME)
            .createdOn(UPDATED_CREATED_ON)
            .updatedOn(UPDATED_UPDATED_ON);

        restMessageThreadMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedMessageThread.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedMessageThread))
            )
            .andExpect(status().isOk());

        // Validate the MessageThread in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertMessageThreadUpdatableFieldsEquals(partialUpdatedMessageThread, getPersistedMessageThread(partialUpdatedMessageThread));
    }

    @Test
    @Transactional
    void patchNonExistingMessageThread() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        messageThread.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restMessageThreadMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, messageThread.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(messageThread))
            )
            .andExpect(status().isBadRequest());

        // Validate the MessageThread in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchMessageThread() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        messageThread.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restMessageThreadMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(messageThread))
            )
            .andExpect(status().isBadRequest());

        // Validate the MessageThread in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamMessageThread() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        messageThread.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restMessageThreadMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(messageThread)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the MessageThread in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteMessageThread() throws Exception {
        // Initialize the database
        insertedMessageThread = messageThreadRepository.saveAndFlush(messageThread);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the messageThread
        restMessageThreadMockMvc
            .perform(delete(ENTITY_API_URL_ID, messageThread.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return messageThreadRepository.count();
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

    protected MessageThread getPersistedMessageThread(MessageThread messageThread) {
        return messageThreadRepository.findById(messageThread.getId()).orElseThrow();
    }

    protected void assertPersistedMessageThreadToMatchAllProperties(MessageThread expectedMessageThread) {
        assertMessageThreadAllPropertiesEquals(expectedMessageThread, getPersistedMessageThread(expectedMessageThread));
    }

    protected void assertPersistedMessageThreadToMatchUpdatableProperties(MessageThread expectedMessageThread) {
        assertMessageThreadAllUpdatablePropertiesEquals(expectedMessageThread, getPersistedMessageThread(expectedMessageThread));
    }
}
