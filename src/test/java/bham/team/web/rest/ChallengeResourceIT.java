package bham.team.web.rest;

import static bham.team.domain.ChallengeAsserts.*;
import static bham.team.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import bham.team.IntegrationTest;
import bham.team.domain.Challenge;
import bham.team.domain.enumeration.Category;
import bham.team.repository.ChallengeRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.time.LocalDate;
import java.time.ZoneId;
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
 * Integration tests for the {@link ChallengeResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class ChallengeResourceIT {

    private static final String DEFAULT_TITLE = "AAAAAAAAAA";
    private static final String UPDATED_TITLE = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final Category DEFAULT_CATEGORY = Category.STUDY;
    private static final Category UPDATED_CATEGORY = Category.SPORTS;

    private static final LocalDate DEFAULT_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_DATE = LocalDate.now(ZoneId.systemDefault());

    private static final Integer DEFAULT_POINTS = 1;
    private static final Integer UPDATED_POINTS = 2;

    private static final byte[] DEFAULT_BADGE = TestUtil.createByteArray(1, "0");
    private static final byte[] UPDATED_BADGE = TestUtil.createByteArray(1, "1");
    private static final String DEFAULT_BADGE_CONTENT_TYPE = "image/jpg";
    private static final String UPDATED_BADGE_CONTENT_TYPE = "image/png";

    private static final Boolean DEFAULT_COMPLETED = false;
    private static final Boolean UPDATED_COMPLETED = true;

    private static final String ENTITY_API_URL = "/api/challenges";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ChallengeRepository challengeRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restChallengeMockMvc;

    private Challenge challenge;

    private Challenge insertedChallenge;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Challenge createEntity() {
        return new Challenge()
            .title(DEFAULT_TITLE)
            .description(DEFAULT_DESCRIPTION)
            .category(DEFAULT_CATEGORY)
            .date(DEFAULT_DATE)
            .points(DEFAULT_POINTS)
            .badge(DEFAULT_BADGE)
            .badgeContentType(DEFAULT_BADGE_CONTENT_TYPE)
            .completed(DEFAULT_COMPLETED);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Challenge createUpdatedEntity() {
        return new Challenge()
            .title(UPDATED_TITLE)
            .description(UPDATED_DESCRIPTION)
            .category(UPDATED_CATEGORY)
            .date(UPDATED_DATE)
            .points(UPDATED_POINTS)
            .badge(UPDATED_BADGE)
            .badgeContentType(UPDATED_BADGE_CONTENT_TYPE)
            .completed(UPDATED_COMPLETED);
    }

    @BeforeEach
    public void initTest() {
        challenge = createEntity();
    }

    @AfterEach
    public void cleanup() {
        if (insertedChallenge != null) {
            challengeRepository.delete(insertedChallenge);
            insertedChallenge = null;
        }
    }

    @Test
    @Transactional
    void createChallenge() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Challenge
        var returnedChallenge = om.readValue(
            restChallengeMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(challenge)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            Challenge.class
        );

        // Validate the Challenge in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertChallengeUpdatableFieldsEquals(returnedChallenge, getPersistedChallenge(returnedChallenge));

        insertedChallenge = returnedChallenge;
    }

    @Test
    @Transactional
    void createChallengeWithExistingId() throws Exception {
        // Create the Challenge with an existing ID
        challenge.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restChallengeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(challenge)))
            .andExpect(status().isBadRequest());

        // Validate the Challenge in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTitleIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        challenge.setTitle(null);

        // Create the Challenge, which fails.

        restChallengeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(challenge)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCategoryIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        challenge.setCategory(null);

        // Create the Challenge, which fails.

        restChallengeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(challenge)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        challenge.setDate(null);

        // Create the Challenge, which fails.

        restChallengeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(challenge)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkPointsIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        challenge.setPoints(null);

        // Create the Challenge, which fails.

        restChallengeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(challenge)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCompletedIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        challenge.setCompleted(null);

        // Create the Challenge, which fails.

        restChallengeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(challenge)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllChallenges() throws Exception {
        // Initialize the database
        insertedChallenge = challengeRepository.saveAndFlush(challenge);

        // Get all the challengeList
        restChallengeMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(challenge.getId().intValue())))
            .andExpect(jsonPath("$.[*].title").value(hasItem(DEFAULT_TITLE)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())))
            .andExpect(jsonPath("$.[*].category").value(hasItem(DEFAULT_CATEGORY.toString())))
            .andExpect(jsonPath("$.[*].date").value(hasItem(DEFAULT_DATE.toString())))
            .andExpect(jsonPath("$.[*].points").value(hasItem(DEFAULT_POINTS)))
            .andExpect(jsonPath("$.[*].badgeContentType").value(hasItem(DEFAULT_BADGE_CONTENT_TYPE)))
            .andExpect(jsonPath("$.[*].badge").value(hasItem(Base64.getEncoder().encodeToString(DEFAULT_BADGE))))
            .andExpect(jsonPath("$.[*].completed").value(hasItem(DEFAULT_COMPLETED.booleanValue())));
    }

    @Test
    @Transactional
    void getChallenge() throws Exception {
        // Initialize the database
        insertedChallenge = challengeRepository.saveAndFlush(challenge);

        // Get the challenge
        restChallengeMockMvc
            .perform(get(ENTITY_API_URL_ID, challenge.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(challenge.getId().intValue()))
            .andExpect(jsonPath("$.title").value(DEFAULT_TITLE))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()))
            .andExpect(jsonPath("$.category").value(DEFAULT_CATEGORY.toString()))
            .andExpect(jsonPath("$.date").value(DEFAULT_DATE.toString()))
            .andExpect(jsonPath("$.points").value(DEFAULT_POINTS))
            .andExpect(jsonPath("$.badgeContentType").value(DEFAULT_BADGE_CONTENT_TYPE))
            .andExpect(jsonPath("$.badge").value(Base64.getEncoder().encodeToString(DEFAULT_BADGE)))
            .andExpect(jsonPath("$.completed").value(DEFAULT_COMPLETED.booleanValue()));
    }

    @Test
    @Transactional
    void getNonExistingChallenge() throws Exception {
        // Get the challenge
        restChallengeMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingChallenge() throws Exception {
        // Initialize the database
        insertedChallenge = challengeRepository.saveAndFlush(challenge);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the challenge
        Challenge updatedChallenge = challengeRepository.findById(challenge.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedChallenge are not directly saved in db
        em.detach(updatedChallenge);
        updatedChallenge
            .title(UPDATED_TITLE)
            .description(UPDATED_DESCRIPTION)
            .category(UPDATED_CATEGORY)
            .date(UPDATED_DATE)
            .points(UPDATED_POINTS)
            .badge(UPDATED_BADGE)
            .badgeContentType(UPDATED_BADGE_CONTENT_TYPE)
            .completed(UPDATED_COMPLETED);

        restChallengeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedChallenge.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedChallenge))
            )
            .andExpect(status().isOk());

        // Validate the Challenge in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedChallengeToMatchAllProperties(updatedChallenge);
    }

    @Test
    @Transactional
    void putNonExistingChallenge() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        challenge.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restChallengeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, challenge.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(challenge))
            )
            .andExpect(status().isBadRequest());

        // Validate the Challenge in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchChallenge() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        challenge.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restChallengeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(challenge))
            )
            .andExpect(status().isBadRequest());

        // Validate the Challenge in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamChallenge() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        challenge.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restChallengeMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(challenge)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Challenge in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateChallengeWithPatch() throws Exception {
        // Initialize the database
        insertedChallenge = challengeRepository.saveAndFlush(challenge);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the challenge using partial update
        Challenge partialUpdatedChallenge = new Challenge();
        partialUpdatedChallenge.setId(challenge.getId());

        partialUpdatedChallenge
            .title(UPDATED_TITLE)
            .points(UPDATED_POINTS)
            .badge(UPDATED_BADGE)
            .badgeContentType(UPDATED_BADGE_CONTENT_TYPE)
            .completed(UPDATED_COMPLETED);

        restChallengeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedChallenge.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedChallenge))
            )
            .andExpect(status().isOk());

        // Validate the Challenge in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertChallengeUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedChallenge, challenge),
            getPersistedChallenge(challenge)
        );
    }

    @Test
    @Transactional
    void fullUpdateChallengeWithPatch() throws Exception {
        // Initialize the database
        insertedChallenge = challengeRepository.saveAndFlush(challenge);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the challenge using partial update
        Challenge partialUpdatedChallenge = new Challenge();
        partialUpdatedChallenge.setId(challenge.getId());

        partialUpdatedChallenge
            .title(UPDATED_TITLE)
            .description(UPDATED_DESCRIPTION)
            .category(UPDATED_CATEGORY)
            .date(UPDATED_DATE)
            .points(UPDATED_POINTS)
            .badge(UPDATED_BADGE)
            .badgeContentType(UPDATED_BADGE_CONTENT_TYPE)
            .completed(UPDATED_COMPLETED);

        restChallengeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedChallenge.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedChallenge))
            )
            .andExpect(status().isOk());

        // Validate the Challenge in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertChallengeUpdatableFieldsEquals(partialUpdatedChallenge, getPersistedChallenge(partialUpdatedChallenge));
    }

    @Test
    @Transactional
    void patchNonExistingChallenge() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        challenge.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restChallengeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, challenge.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(challenge))
            )
            .andExpect(status().isBadRequest());

        // Validate the Challenge in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchChallenge() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        challenge.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restChallengeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(challenge))
            )
            .andExpect(status().isBadRequest());

        // Validate the Challenge in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamChallenge() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        challenge.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restChallengeMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(challenge)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Challenge in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteChallenge() throws Exception {
        // Initialize the database
        insertedChallenge = challengeRepository.saveAndFlush(challenge);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the challenge
        restChallengeMockMvc
            .perform(delete(ENTITY_API_URL_ID, challenge.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return challengeRepository.count();
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

    protected Challenge getPersistedChallenge(Challenge challenge) {
        return challengeRepository.findById(challenge.getId()).orElseThrow();
    }

    protected void assertPersistedChallengeToMatchAllProperties(Challenge expectedChallenge) {
        assertChallengeAllPropertiesEquals(expectedChallenge, getPersistedChallenge(expectedChallenge));
    }

    protected void assertPersistedChallengeToMatchUpdatableProperties(Challenge expectedChallenge) {
        assertChallengeAllUpdatablePropertiesEquals(expectedChallenge, getPersistedChallenge(expectedChallenge));
    }
}
