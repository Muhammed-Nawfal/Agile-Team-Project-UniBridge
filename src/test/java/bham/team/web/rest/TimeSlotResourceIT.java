package bham.team.web.rest;

import static bham.team.domain.TimeSlotAsserts.*;
import static bham.team.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import bham.team.IntegrationTest;
import bham.team.domain.TimeSlot;
import bham.team.domain.enumeration.AvailabilityStatus;
import bham.team.repository.TimeSlotRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.time.LocalDate;
import java.time.ZoneId;
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
 * Integration tests for the {@link TimeSlotResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class TimeSlotResourceIT {

    private static final LocalDate DEFAULT_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_DATE = LocalDate.now(ZoneId.systemDefault());

    private static final Integer DEFAULT_START_HOUR = 1;
    private static final Integer UPDATED_START_HOUR = 2;

    private static final Integer DEFAULT_END_HOUR = 1;
    private static final Integer UPDATED_END_HOUR = 2;

    private static final Integer DEFAULT_CAPACITY = 1;
    private static final Integer UPDATED_CAPACITY = 2;

    private static final Integer DEFAULT_REMAINING_CAPACITY = 1;
    private static final Integer UPDATED_REMAINING_CAPACITY = 2;

    private static final AvailabilityStatus DEFAULT_STATUS = AvailabilityStatus.AVAILABLE;
    private static final AvailabilityStatus UPDATED_STATUS = AvailabilityStatus.FULL;

    private static final String ENTITY_API_URL = "/api/time-slots";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private TimeSlotRepository timeSlotRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restTimeSlotMockMvc;

    private TimeSlot timeSlot;

    private TimeSlot insertedTimeSlot;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static TimeSlot createEntity() {
        return new TimeSlot()
            .date(DEFAULT_DATE)
            .startHour(DEFAULT_START_HOUR)
            .endHour(DEFAULT_END_HOUR)
            .capacity(DEFAULT_CAPACITY)
            .remainingCapacity(DEFAULT_REMAINING_CAPACITY)
            .status(DEFAULT_STATUS);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static TimeSlot createUpdatedEntity() {
        return new TimeSlot()
            .date(UPDATED_DATE)
            .startHour(UPDATED_START_HOUR)
            .endHour(UPDATED_END_HOUR)
            .capacity(UPDATED_CAPACITY)
            .remainingCapacity(UPDATED_REMAINING_CAPACITY)
            .status(UPDATED_STATUS);
    }

    @BeforeEach
    public void initTest() {
        timeSlot = createEntity();
    }

    @AfterEach
    public void cleanup() {
        if (insertedTimeSlot != null) {
            timeSlotRepository.delete(insertedTimeSlot);
            insertedTimeSlot = null;
        }
    }

    @Test
    @Transactional
    void createTimeSlot() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the TimeSlot
        var returnedTimeSlot = om.readValue(
            restTimeSlotMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(timeSlot)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            TimeSlot.class
        );

        // Validate the TimeSlot in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertTimeSlotUpdatableFieldsEquals(returnedTimeSlot, getPersistedTimeSlot(returnedTimeSlot));

        insertedTimeSlot = returnedTimeSlot;
    }

    @Test
    @Transactional
    void createTimeSlotWithExistingId() throws Exception {
        // Create the TimeSlot with an existing ID
        timeSlot.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restTimeSlotMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(timeSlot)))
            .andExpect(status().isBadRequest());

        // Validate the TimeSlot in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        timeSlot.setDate(null);

        // Create the TimeSlot, which fails.

        restTimeSlotMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(timeSlot)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkStartHourIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        timeSlot.setStartHour(null);

        // Create the TimeSlot, which fails.

        restTimeSlotMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(timeSlot)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkEndHourIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        timeSlot.setEndHour(null);

        // Create the TimeSlot, which fails.

        restTimeSlotMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(timeSlot)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCapacityIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        timeSlot.setCapacity(null);

        // Create the TimeSlot, which fails.

        restTimeSlotMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(timeSlot)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkStatusIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        timeSlot.setStatus(null);

        // Create the TimeSlot, which fails.

        restTimeSlotMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(timeSlot)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllTimeSlots() throws Exception {
        // Initialize the database
        insertedTimeSlot = timeSlotRepository.saveAndFlush(timeSlot);

        // Get all the timeSlotList
        restTimeSlotMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(timeSlot.getId().intValue())))
            .andExpect(jsonPath("$.[*].date").value(hasItem(DEFAULT_DATE.toString())))
            .andExpect(jsonPath("$.[*].startHour").value(hasItem(DEFAULT_START_HOUR)))
            .andExpect(jsonPath("$.[*].endHour").value(hasItem(DEFAULT_END_HOUR)))
            .andExpect(jsonPath("$.[*].capacity").value(hasItem(DEFAULT_CAPACITY)))
            .andExpect(jsonPath("$.[*].remainingCapacity").value(hasItem(DEFAULT_REMAINING_CAPACITY)))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())));
    }

    @Test
    @Transactional
    void getTimeSlot() throws Exception {
        // Initialize the database
        insertedTimeSlot = timeSlotRepository.saveAndFlush(timeSlot);

        // Get the timeSlot
        restTimeSlotMockMvc
            .perform(get(ENTITY_API_URL_ID, timeSlot.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(timeSlot.getId().intValue()))
            .andExpect(jsonPath("$.date").value(DEFAULT_DATE.toString()))
            .andExpect(jsonPath("$.startHour").value(DEFAULT_START_HOUR))
            .andExpect(jsonPath("$.endHour").value(DEFAULT_END_HOUR))
            .andExpect(jsonPath("$.capacity").value(DEFAULT_CAPACITY))
            .andExpect(jsonPath("$.remainingCapacity").value(DEFAULT_REMAINING_CAPACITY))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS.toString()));
    }

    @Test
    @Transactional
    void getNonExistingTimeSlot() throws Exception {
        // Get the timeSlot
        restTimeSlotMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingTimeSlot() throws Exception {
        // Initialize the database
        insertedTimeSlot = timeSlotRepository.saveAndFlush(timeSlot);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the timeSlot
        TimeSlot updatedTimeSlot = timeSlotRepository.findById(timeSlot.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedTimeSlot are not directly saved in db
        em.detach(updatedTimeSlot);
        updatedTimeSlot
            .date(UPDATED_DATE)
            .startHour(UPDATED_START_HOUR)
            .endHour(UPDATED_END_HOUR)
            .capacity(UPDATED_CAPACITY)
            .remainingCapacity(UPDATED_REMAINING_CAPACITY)
            .status(UPDATED_STATUS);

        restTimeSlotMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedTimeSlot.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedTimeSlot))
            )
            .andExpect(status().isOk());

        // Validate the TimeSlot in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedTimeSlotToMatchAllProperties(updatedTimeSlot);
    }

    @Test
    @Transactional
    void putNonExistingTimeSlot() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        timeSlot.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTimeSlotMockMvc
            .perform(
                put(ENTITY_API_URL_ID, timeSlot.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(timeSlot))
            )
            .andExpect(status().isBadRequest());

        // Validate the TimeSlot in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchTimeSlot() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        timeSlot.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTimeSlotMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(timeSlot))
            )
            .andExpect(status().isBadRequest());

        // Validate the TimeSlot in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamTimeSlot() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        timeSlot.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTimeSlotMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(timeSlot)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the TimeSlot in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateTimeSlotWithPatch() throws Exception {
        // Initialize the database
        insertedTimeSlot = timeSlotRepository.saveAndFlush(timeSlot);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the timeSlot using partial update
        TimeSlot partialUpdatedTimeSlot = new TimeSlot();
        partialUpdatedTimeSlot.setId(timeSlot.getId());

        partialUpdatedTimeSlot.date(UPDATED_DATE).capacity(UPDATED_CAPACITY).remainingCapacity(UPDATED_REMAINING_CAPACITY);

        restTimeSlotMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTimeSlot.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedTimeSlot))
            )
            .andExpect(status().isOk());

        // Validate the TimeSlot in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertTimeSlotUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedTimeSlot, timeSlot), getPersistedTimeSlot(timeSlot));
    }

    @Test
    @Transactional
    void fullUpdateTimeSlotWithPatch() throws Exception {
        // Initialize the database
        insertedTimeSlot = timeSlotRepository.saveAndFlush(timeSlot);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the timeSlot using partial update
        TimeSlot partialUpdatedTimeSlot = new TimeSlot();
        partialUpdatedTimeSlot.setId(timeSlot.getId());

        partialUpdatedTimeSlot
            .date(UPDATED_DATE)
            .startHour(UPDATED_START_HOUR)
            .endHour(UPDATED_END_HOUR)
            .capacity(UPDATED_CAPACITY)
            .remainingCapacity(UPDATED_REMAINING_CAPACITY)
            .status(UPDATED_STATUS);

        restTimeSlotMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTimeSlot.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedTimeSlot))
            )
            .andExpect(status().isOk());

        // Validate the TimeSlot in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertTimeSlotUpdatableFieldsEquals(partialUpdatedTimeSlot, getPersistedTimeSlot(partialUpdatedTimeSlot));
    }

    @Test
    @Transactional
    void patchNonExistingTimeSlot() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        timeSlot.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTimeSlotMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, timeSlot.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(timeSlot))
            )
            .andExpect(status().isBadRequest());

        // Validate the TimeSlot in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchTimeSlot() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        timeSlot.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTimeSlotMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(timeSlot))
            )
            .andExpect(status().isBadRequest());

        // Validate the TimeSlot in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamTimeSlot() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        timeSlot.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTimeSlotMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(timeSlot)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the TimeSlot in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteTimeSlot() throws Exception {
        // Initialize the database
        insertedTimeSlot = timeSlotRepository.saveAndFlush(timeSlot);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the timeSlot
        restTimeSlotMockMvc
            .perform(delete(ENTITY_API_URL_ID, timeSlot.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return timeSlotRepository.count();
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

    protected TimeSlot getPersistedTimeSlot(TimeSlot timeSlot) {
        return timeSlotRepository.findById(timeSlot.getId()).orElseThrow();
    }

    protected void assertPersistedTimeSlotToMatchAllProperties(TimeSlot expectedTimeSlot) {
        assertTimeSlotAllPropertiesEquals(expectedTimeSlot, getPersistedTimeSlot(expectedTimeSlot));
    }

    protected void assertPersistedTimeSlotToMatchUpdatableProperties(TimeSlot expectedTimeSlot) {
        assertTimeSlotAllUpdatablePropertiesEquals(expectedTimeSlot, getPersistedTimeSlot(expectedTimeSlot));
    }
}
