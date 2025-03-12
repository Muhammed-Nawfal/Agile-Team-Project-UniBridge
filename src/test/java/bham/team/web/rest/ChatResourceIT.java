package bham.team.web.rest;

import static bham.team.domain.ChatAsserts.*;
import static bham.team.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import bham.team.IntegrationTest;
import bham.team.domain.Chat;
import bham.team.domain.enumeration.ActionType;
import bham.team.repository.ChatRepository;
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
 * Integration tests for the {@link ChatResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class ChatResourceIT {

    private static final String DEFAULT_MESSAGE = "AAAAAAAAAA";
    private static final String UPDATED_MESSAGE = "BBBBBBBBBB";

    private static final Instant DEFAULT_TIMESTAMP = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_TIMESTAMP = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final ActionType DEFAULT_TYPE = ActionType.UNMATCH;
    private static final ActionType UPDATED_TYPE = ActionType.REPORT;

    private static final String ENTITY_API_URL = "/api/chats";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restChatMockMvc;

    private Chat chat;

    private Chat insertedChat;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Chat createEntity() {
        return new Chat().message(DEFAULT_MESSAGE).timestamp(DEFAULT_TIMESTAMP).type(DEFAULT_TYPE);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Chat createUpdatedEntity() {
        return new Chat().message(UPDATED_MESSAGE).timestamp(UPDATED_TIMESTAMP).type(UPDATED_TYPE);
    }

    @BeforeEach
    public void initTest() {
        chat = createEntity();
    }

    @AfterEach
    public void cleanup() {
        if (insertedChat != null) {
            chatRepository.delete(insertedChat);
            insertedChat = null;
        }
    }

    @Test
    @Transactional
    void createChat() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Chat
        var returnedChat = om.readValue(
            restChatMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(chat)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            Chat.class
        );

        // Validate the Chat in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertChatUpdatableFieldsEquals(returnedChat, getPersistedChat(returnedChat));

        insertedChat = returnedChat;
    }

    @Test
    @Transactional
    void createChatWithExistingId() throws Exception {
        // Create the Chat with an existing ID
        chat.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restChatMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(chat)))
            .andExpect(status().isBadRequest());

        // Validate the Chat in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTimestampIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        chat.setTimestamp(null);

        // Create the Chat, which fails.

        restChatMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(chat)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTypeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        chat.setType(null);

        // Create the Chat, which fails.

        restChatMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(chat)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllChats() throws Exception {
        // Initialize the database
        insertedChat = chatRepository.saveAndFlush(chat);

        // Get all the chatList
        restChatMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(chat.getId().intValue())))
            .andExpect(jsonPath("$.[*].message").value(hasItem(DEFAULT_MESSAGE.toString())))
            .andExpect(jsonPath("$.[*].timestamp").value(hasItem(DEFAULT_TIMESTAMP.toString())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())));
    }

    @Test
    @Transactional
    void getChat() throws Exception {
        // Initialize the database
        insertedChat = chatRepository.saveAndFlush(chat);

        // Get the chat
        restChatMockMvc
            .perform(get(ENTITY_API_URL_ID, chat.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(chat.getId().intValue()))
            .andExpect(jsonPath("$.message").value(DEFAULT_MESSAGE.toString()))
            .andExpect(jsonPath("$.timestamp").value(DEFAULT_TIMESTAMP.toString()))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE.toString()));
    }

    @Test
    @Transactional
    void getNonExistingChat() throws Exception {
        // Get the chat
        restChatMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingChat() throws Exception {
        // Initialize the database
        insertedChat = chatRepository.saveAndFlush(chat);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the chat
        Chat updatedChat = chatRepository.findById(chat.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedChat are not directly saved in db
        em.detach(updatedChat);
        updatedChat.message(UPDATED_MESSAGE).timestamp(UPDATED_TIMESTAMP).type(UPDATED_TYPE);

        restChatMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedChat.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedChat))
            )
            .andExpect(status().isOk());

        // Validate the Chat in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedChatToMatchAllProperties(updatedChat);
    }

    @Test
    @Transactional
    void putNonExistingChat() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        chat.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restChatMockMvc
            .perform(put(ENTITY_API_URL_ID, chat.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(chat)))
            .andExpect(status().isBadRequest());

        // Validate the Chat in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchChat() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        chat.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restChatMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(chat))
            )
            .andExpect(status().isBadRequest());

        // Validate the Chat in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamChat() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        chat.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restChatMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(chat)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Chat in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateChatWithPatch() throws Exception {
        // Initialize the database
        insertedChat = chatRepository.saveAndFlush(chat);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the chat using partial update
        Chat partialUpdatedChat = new Chat();
        partialUpdatedChat.setId(chat.getId());

        restChatMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedChat.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedChat))
            )
            .andExpect(status().isOk());

        // Validate the Chat in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertChatUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedChat, chat), getPersistedChat(chat));
    }

    @Test
    @Transactional
    void fullUpdateChatWithPatch() throws Exception {
        // Initialize the database
        insertedChat = chatRepository.saveAndFlush(chat);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the chat using partial update
        Chat partialUpdatedChat = new Chat();
        partialUpdatedChat.setId(chat.getId());

        partialUpdatedChat.message(UPDATED_MESSAGE).timestamp(UPDATED_TIMESTAMP).type(UPDATED_TYPE);

        restChatMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedChat.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedChat))
            )
            .andExpect(status().isOk());

        // Validate the Chat in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertChatUpdatableFieldsEquals(partialUpdatedChat, getPersistedChat(partialUpdatedChat));
    }

    @Test
    @Transactional
    void patchNonExistingChat() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        chat.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restChatMockMvc
            .perform(patch(ENTITY_API_URL_ID, chat.getId()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(chat)))
            .andExpect(status().isBadRequest());

        // Validate the Chat in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchChat() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        chat.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restChatMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(chat))
            )
            .andExpect(status().isBadRequest());

        // Validate the Chat in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamChat() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        chat.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restChatMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(chat)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Chat in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteChat() throws Exception {
        // Initialize the database
        insertedChat = chatRepository.saveAndFlush(chat);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the chat
        restChatMockMvc
            .perform(delete(ENTITY_API_URL_ID, chat.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return chatRepository.count();
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

    protected Chat getPersistedChat(Chat chat) {
        return chatRepository.findById(chat.getId()).orElseThrow();
    }

    protected void assertPersistedChatToMatchAllProperties(Chat expectedChat) {
        assertChatAllPropertiesEquals(expectedChat, getPersistedChat(expectedChat));
    }

    protected void assertPersistedChatToMatchUpdatableProperties(Chat expectedChat) {
        assertChatAllUpdatablePropertiesEquals(expectedChat, getPersistedChat(expectedChat));
    }
}
