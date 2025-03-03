package bham.team.web.rest;

import static bham.team.domain.FriendsListAsserts.*;
import static bham.team.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import bham.team.IntegrationTest;
import bham.team.domain.FriendsList;
import bham.team.domain.enumeration.Decision;
import bham.team.repository.FriendsListRepository;
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
 * Integration tests for the {@link FriendsListResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class FriendsListResourceIT {

    private static final Decision DEFAULT_FRIEND_REQUEST = Decision.ACCEPT;
    private static final Decision UPDATED_FRIEND_REQUEST = Decision.DECLINED;

    private static final Instant DEFAULT_FRIEND_SINCE = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_FRIEND_SINCE = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/friends-lists";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private FriendsListRepository friendsListRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restFriendsListMockMvc;

    private FriendsList friendsList;

    private FriendsList insertedFriendsList;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static FriendsList createEntity() {
        return new FriendsList().friendRequest(DEFAULT_FRIEND_REQUEST).friendSince(DEFAULT_FRIEND_SINCE);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static FriendsList createUpdatedEntity() {
        return new FriendsList().friendRequest(UPDATED_FRIEND_REQUEST).friendSince(UPDATED_FRIEND_SINCE);
    }

    @BeforeEach
    public void initTest() {
        friendsList = createEntity();
    }

    @AfterEach
    public void cleanup() {
        if (insertedFriendsList != null) {
            friendsListRepository.delete(insertedFriendsList);
            insertedFriendsList = null;
        }
    }

    @Test
    @Transactional
    void createFriendsList() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the FriendsList
        var returnedFriendsList = om.readValue(
            restFriendsListMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(friendsList)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            FriendsList.class
        );

        // Validate the FriendsList in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertFriendsListUpdatableFieldsEquals(returnedFriendsList, getPersistedFriendsList(returnedFriendsList));

        insertedFriendsList = returnedFriendsList;
    }

    @Test
    @Transactional
    void createFriendsListWithExistingId() throws Exception {
        // Create the FriendsList with an existing ID
        friendsList.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restFriendsListMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(friendsList)))
            .andExpect(status().isBadRequest());

        // Validate the FriendsList in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkFriendRequestIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        friendsList.setFriendRequest(null);

        // Create the FriendsList, which fails.

        restFriendsListMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(friendsList)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkFriendSinceIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        friendsList.setFriendSince(null);

        // Create the FriendsList, which fails.

        restFriendsListMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(friendsList)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllFriendsLists() throws Exception {
        // Initialize the database
        insertedFriendsList = friendsListRepository.saveAndFlush(friendsList);

        // Get all the friendsListList
        restFriendsListMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(friendsList.getId().intValue())))
            .andExpect(jsonPath("$.[*].friendRequest").value(hasItem(DEFAULT_FRIEND_REQUEST.toString())))
            .andExpect(jsonPath("$.[*].friendSince").value(hasItem(DEFAULT_FRIEND_SINCE.toString())));
    }

    @Test
    @Transactional
    void getFriendsList() throws Exception {
        // Initialize the database
        insertedFriendsList = friendsListRepository.saveAndFlush(friendsList);

        // Get the friendsList
        restFriendsListMockMvc
            .perform(get(ENTITY_API_URL_ID, friendsList.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(friendsList.getId().intValue()))
            .andExpect(jsonPath("$.friendRequest").value(DEFAULT_FRIEND_REQUEST.toString()))
            .andExpect(jsonPath("$.friendSince").value(DEFAULT_FRIEND_SINCE.toString()));
    }

    @Test
    @Transactional
    void getNonExistingFriendsList() throws Exception {
        // Get the friendsList
        restFriendsListMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingFriendsList() throws Exception {
        // Initialize the database
        insertedFriendsList = friendsListRepository.saveAndFlush(friendsList);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the friendsList
        FriendsList updatedFriendsList = friendsListRepository.findById(friendsList.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedFriendsList are not directly saved in db
        em.detach(updatedFriendsList);
        updatedFriendsList.friendRequest(UPDATED_FRIEND_REQUEST).friendSince(UPDATED_FRIEND_SINCE);

        restFriendsListMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedFriendsList.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedFriendsList))
            )
            .andExpect(status().isOk());

        // Validate the FriendsList in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedFriendsListToMatchAllProperties(updatedFriendsList);
    }

    @Test
    @Transactional
    void putNonExistingFriendsList() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        friendsList.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restFriendsListMockMvc
            .perform(
                put(ENTITY_API_URL_ID, friendsList.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(friendsList))
            )
            .andExpect(status().isBadRequest());

        // Validate the FriendsList in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchFriendsList() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        friendsList.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFriendsListMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(friendsList))
            )
            .andExpect(status().isBadRequest());

        // Validate the FriendsList in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamFriendsList() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        friendsList.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFriendsListMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(friendsList)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the FriendsList in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateFriendsListWithPatch() throws Exception {
        // Initialize the database
        insertedFriendsList = friendsListRepository.saveAndFlush(friendsList);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the friendsList using partial update
        FriendsList partialUpdatedFriendsList = new FriendsList();
        partialUpdatedFriendsList.setId(friendsList.getId());

        partialUpdatedFriendsList.friendSince(UPDATED_FRIEND_SINCE);

        restFriendsListMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedFriendsList.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedFriendsList))
            )
            .andExpect(status().isOk());

        // Validate the FriendsList in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertFriendsListUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedFriendsList, friendsList),
            getPersistedFriendsList(friendsList)
        );
    }

    @Test
    @Transactional
    void fullUpdateFriendsListWithPatch() throws Exception {
        // Initialize the database
        insertedFriendsList = friendsListRepository.saveAndFlush(friendsList);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the friendsList using partial update
        FriendsList partialUpdatedFriendsList = new FriendsList();
        partialUpdatedFriendsList.setId(friendsList.getId());

        partialUpdatedFriendsList.friendRequest(UPDATED_FRIEND_REQUEST).friendSince(UPDATED_FRIEND_SINCE);

        restFriendsListMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedFriendsList.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedFriendsList))
            )
            .andExpect(status().isOk());

        // Validate the FriendsList in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertFriendsListUpdatableFieldsEquals(partialUpdatedFriendsList, getPersistedFriendsList(partialUpdatedFriendsList));
    }

    @Test
    @Transactional
    void patchNonExistingFriendsList() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        friendsList.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restFriendsListMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, friendsList.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(friendsList))
            )
            .andExpect(status().isBadRequest());

        // Validate the FriendsList in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchFriendsList() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        friendsList.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFriendsListMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(friendsList))
            )
            .andExpect(status().isBadRequest());

        // Validate the FriendsList in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamFriendsList() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        friendsList.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFriendsListMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(friendsList)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the FriendsList in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteFriendsList() throws Exception {
        // Initialize the database
        insertedFriendsList = friendsListRepository.saveAndFlush(friendsList);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the friendsList
        restFriendsListMockMvc
            .perform(delete(ENTITY_API_URL_ID, friendsList.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return friendsListRepository.count();
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

    protected FriendsList getPersistedFriendsList(FriendsList friendsList) {
        return friendsListRepository.findById(friendsList.getId()).orElseThrow();
    }

    protected void assertPersistedFriendsListToMatchAllProperties(FriendsList expectedFriendsList) {
        assertFriendsListAllPropertiesEquals(expectedFriendsList, getPersistedFriendsList(expectedFriendsList));
    }

    protected void assertPersistedFriendsListToMatchUpdatableProperties(FriendsList expectedFriendsList) {
        assertFriendsListAllUpdatablePropertiesEquals(expectedFriendsList, getPersistedFriendsList(expectedFriendsList));
    }
}
