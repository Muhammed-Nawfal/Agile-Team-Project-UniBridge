package bham.team.web.rest;

import static bham.team.domain.ReviewAsserts.*;
import static bham.team.web.rest.TestUtil.createUpdateProxyForBean;
import static bham.team.web.rest.TestUtil.sameNumber;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import bham.team.IntegrationTest;
import bham.team.domain.Review;
import bham.team.repository.ReviewRepository;
import bham.team.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
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
 * Integration tests for the {@link ReviewResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class ReviewResourceIT {

    private static final Instant DEFAULT_DATE_PUBLISHED = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_DATE_PUBLISHED = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final BigDecimal DEFAULT_STAR = new BigDecimal(0);
    private static final BigDecimal UPDATED_STAR = new BigDecimal(1);

    private static final String DEFAULT_TEXT = "AAAAAAAAAA";
    private static final String UPDATED_TEXT = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/reviews";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restReviewMockMvc;

    private Review review;

    private Review insertedReview;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Review createEntity() {
        return new Review().datePublished(DEFAULT_DATE_PUBLISHED).star(DEFAULT_STAR).text(DEFAULT_TEXT);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Review createUpdatedEntity() {
        return new Review().datePublished(UPDATED_DATE_PUBLISHED).star(UPDATED_STAR).text(UPDATED_TEXT);
    }

    @BeforeEach
    public void initTest() {
        review = createEntity();
    }

    @AfterEach
    public void cleanup() {
        if (insertedReview != null) {
            reviewRepository.delete(insertedReview);
            insertedReview = null;
        }
    }

    @Test
    @Transactional
    void createReview() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Review
        var returnedReview = om.readValue(
            restReviewMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(review)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            Review.class
        );

        // Validate the Review in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertReviewUpdatableFieldsEquals(returnedReview, getPersistedReview(returnedReview));

        insertedReview = returnedReview;
    }

    @Test
    @Transactional
    void createReviewWithExistingId() throws Exception {
        // Create the Review with an existing ID
        review.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restReviewMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(review)))
            .andExpect(status().isBadRequest());

        // Validate the Review in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkDatePublishedIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        review.setDatePublished(null);

        // Create the Review, which fails.

        restReviewMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(review)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkStarIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        review.setStar(null);

        // Create the Review, which fails.

        restReviewMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(review)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllReviews() throws Exception {
        // Initialize the database
        insertedReview = reviewRepository.saveAndFlush(review);

        // Get all the reviewList
        restReviewMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(review.getId().intValue())))
            .andExpect(jsonPath("$.[*].datePublished").value(hasItem(DEFAULT_DATE_PUBLISHED.toString())))
            .andExpect(jsonPath("$.[*].star").value(hasItem(sameNumber(DEFAULT_STAR))))
            .andExpect(jsonPath("$.[*].text").value(hasItem(DEFAULT_TEXT)));
    }

    @Test
    @Transactional
    void getReview() throws Exception {
        // Initialize the database
        insertedReview = reviewRepository.saveAndFlush(review);

        // Get the review
        restReviewMockMvc
            .perform(get(ENTITY_API_URL_ID, review.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(review.getId().intValue()))
            .andExpect(jsonPath("$.datePublished").value(DEFAULT_DATE_PUBLISHED.toString()))
            .andExpect(jsonPath("$.star").value(sameNumber(DEFAULT_STAR)))
            .andExpect(jsonPath("$.text").value(DEFAULT_TEXT));
    }

    @Test
    @Transactional
    void getNonExistingReview() throws Exception {
        // Get the review
        restReviewMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingReview() throws Exception {
        // Initialize the database
        insertedReview = reviewRepository.saveAndFlush(review);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the review
        Review updatedReview = reviewRepository.findById(review.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedReview are not directly saved in db
        em.detach(updatedReview);
        updatedReview.datePublished(UPDATED_DATE_PUBLISHED).star(UPDATED_STAR).text(UPDATED_TEXT);

        restReviewMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedReview.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedReview))
            )
            .andExpect(status().isOk());

        // Validate the Review in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedReviewToMatchAllProperties(updatedReview);
    }

    @Test
    @Transactional
    void putNonExistingReview() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        review.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restReviewMockMvc
            .perform(put(ENTITY_API_URL_ID, review.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(review)))
            .andExpect(status().isBadRequest());

        // Validate the Review in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchReview() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        review.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restReviewMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(review))
            )
            .andExpect(status().isBadRequest());

        // Validate the Review in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamReview() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        review.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restReviewMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(review)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Review in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateReviewWithPatch() throws Exception {
        // Initialize the database
        insertedReview = reviewRepository.saveAndFlush(review);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the review using partial update
        Review partialUpdatedReview = new Review();
        partialUpdatedReview.setId(review.getId());

        partialUpdatedReview.datePublished(UPDATED_DATE_PUBLISHED).star(UPDATED_STAR).text(UPDATED_TEXT);

        restReviewMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedReview.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedReview))
            )
            .andExpect(status().isOk());

        // Validate the Review in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertReviewUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedReview, review), getPersistedReview(review));
    }

    @Test
    @Transactional
    void fullUpdateReviewWithPatch() throws Exception {
        // Initialize the database
        insertedReview = reviewRepository.saveAndFlush(review);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the review using partial update
        Review partialUpdatedReview = new Review();
        partialUpdatedReview.setId(review.getId());

        partialUpdatedReview.datePublished(UPDATED_DATE_PUBLISHED).star(UPDATED_STAR).text(UPDATED_TEXT);

        restReviewMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedReview.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedReview))
            )
            .andExpect(status().isOk());

        // Validate the Review in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertReviewUpdatableFieldsEquals(partialUpdatedReview, getPersistedReview(partialUpdatedReview));
    }

    @Test
    @Transactional
    void patchNonExistingReview() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        review.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restReviewMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, review.getId()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(review))
            )
            .andExpect(status().isBadRequest());

        // Validate the Review in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchReview() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        review.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restReviewMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(review))
            )
            .andExpect(status().isBadRequest());

        // Validate the Review in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamReview() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        review.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restReviewMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(review)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Review in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteReview() throws Exception {
        // Initialize the database
        insertedReview = reviewRepository.saveAndFlush(review);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the review
        restReviewMockMvc
            .perform(delete(ENTITY_API_URL_ID, review.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return reviewRepository.count();
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

    protected Review getPersistedReview(Review review) {
        return reviewRepository.findById(review.getId()).orElseThrow();
    }

    protected void assertPersistedReviewToMatchAllProperties(Review expectedReview) {
        assertReviewAllPropertiesEquals(expectedReview, getPersistedReview(expectedReview));
    }

    protected void assertPersistedReviewToMatchUpdatableProperties(Review expectedReview) {
        assertReviewAllUpdatablePropertiesEquals(expectedReview, getPersistedReview(expectedReview));
    }
}
