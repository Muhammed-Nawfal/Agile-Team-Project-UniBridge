package bham.team.web.rest;

import static bham.team.domain.BookingAsserts.*;
import static bham.team.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import bham.team.IntegrationTest;
import bham.team.domain.Booking;
import bham.team.domain.enumeration.ActivityType;
import bham.team.domain.enumeration.BookingStatus;
import bham.team.domain.enumeration.EventType;
import bham.team.repository.BookingRepository;
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
 * Integration tests for the {@link BookingResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class BookingResourceIT {

    private static final ActivityType DEFAULT_ACTIVITY_TYPE = ActivityType.SOCIAL;
    private static final ActivityType UPDATED_ACTIVITY_TYPE = ActivityType.ACADEMIC;

    private static final EventType DEFAULT_EVENT_TYPE = EventType.STUDY_SPACES;
    private static final EventType UPDATED_EVENT_TYPE = EventType.EVENT_ROOMS;

    private static final LocalDate DEFAULT_BOOKING_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_BOOKING_DATE = LocalDate.now(ZoneId.systemDefault());

    private static final Integer DEFAULT_PARTY_SIZE = 1;
    private static final Integer UPDATED_PARTY_SIZE = 2;

    private static final BookingStatus DEFAULT_BOOKING_STATUS = BookingStatus.CONFIRMED;
    private static final BookingStatus UPDATED_BOOKING_STATUS = BookingStatus.CANCELLED;

    private static final Instant DEFAULT_CREATED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CREATED_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Instant DEFAULT_ASSIGNED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_ASSIGNED_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/bookings";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restBookingMockMvc;

    private Booking booking;

    private Booking insertedBooking;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Booking createEntity() {
        return new Booking()
            .activityType(DEFAULT_ACTIVITY_TYPE)
            .eventType(DEFAULT_EVENT_TYPE)
            .bookingDate(DEFAULT_BOOKING_DATE)
            .partySize(DEFAULT_PARTY_SIZE)
            .bookingStatus(DEFAULT_BOOKING_STATUS)
            .createdAt(DEFAULT_CREATED_AT)
            .assignedAt(DEFAULT_ASSIGNED_AT);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Booking createUpdatedEntity() {
        return new Booking()
            .activityType(UPDATED_ACTIVITY_TYPE)
            .eventType(UPDATED_EVENT_TYPE)
            .bookingDate(UPDATED_BOOKING_DATE)
            .partySize(UPDATED_PARTY_SIZE)
            .bookingStatus(UPDATED_BOOKING_STATUS)
            .createdAt(UPDATED_CREATED_AT)
            .assignedAt(UPDATED_ASSIGNED_AT);
    }

    @BeforeEach
    public void initTest() {
        booking = createEntity();
    }

    @AfterEach
    public void cleanup() {
        if (insertedBooking != null) {
            bookingRepository.delete(insertedBooking);
            insertedBooking = null;
        }
    }

    @Test
    @Transactional
    void createBooking() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Booking
        var returnedBooking = om.readValue(
            restBookingMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(booking)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            Booking.class
        );

        // Validate the Booking in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertBookingUpdatableFieldsEquals(returnedBooking, getPersistedBooking(returnedBooking));

        insertedBooking = returnedBooking;
    }

    @Test
    @Transactional
    void createBookingWithExistingId() throws Exception {
        // Create the Booking with an existing ID
        booking.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restBookingMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(booking)))
            .andExpect(status().isBadRequest());

        // Validate the Booking in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkActivityTypeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        booking.setActivityType(null);

        // Create the Booking, which fails.

        restBookingMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(booking)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkEventTypeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        booking.setEventType(null);

        // Create the Booking, which fails.

        restBookingMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(booking)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkBookingDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        booking.setBookingDate(null);

        // Create the Booking, which fails.

        restBookingMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(booking)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkPartySizeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        booking.setPartySize(null);

        // Create the Booking, which fails.

        restBookingMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(booking)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkBookingStatusIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        booking.setBookingStatus(null);

        // Create the Booking, which fails.

        restBookingMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(booking)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllBookings() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList
        restBookingMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(booking.getId().intValue())))
            .andExpect(jsonPath("$.[*].activityType").value(hasItem(DEFAULT_ACTIVITY_TYPE.toString())))
            .andExpect(jsonPath("$.[*].eventType").value(hasItem(DEFAULT_EVENT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].bookingDate").value(hasItem(DEFAULT_BOOKING_DATE.toString())))
            .andExpect(jsonPath("$.[*].partySize").value(hasItem(DEFAULT_PARTY_SIZE)))
            .andExpect(jsonPath("$.[*].bookingStatus").value(hasItem(DEFAULT_BOOKING_STATUS.toString())))
            .andExpect(jsonPath("$.[*].createdAt").value(hasItem(DEFAULT_CREATED_AT.toString())))
            .andExpect(jsonPath("$.[*].assignedAt").value(hasItem(DEFAULT_ASSIGNED_AT.toString())));
    }

    @Test
    @Transactional
    void getBooking() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get the booking
        restBookingMockMvc
            .perform(get(ENTITY_API_URL_ID, booking.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(booking.getId().intValue()))
            .andExpect(jsonPath("$.activityType").value(DEFAULT_ACTIVITY_TYPE.toString()))
            .andExpect(jsonPath("$.eventType").value(DEFAULT_EVENT_TYPE.toString()))
            .andExpect(jsonPath("$.bookingDate").value(DEFAULT_BOOKING_DATE.toString()))
            .andExpect(jsonPath("$.partySize").value(DEFAULT_PARTY_SIZE))
            .andExpect(jsonPath("$.bookingStatus").value(DEFAULT_BOOKING_STATUS.toString()))
            .andExpect(jsonPath("$.createdAt").value(DEFAULT_CREATED_AT.toString()))
            .andExpect(jsonPath("$.assignedAt").value(DEFAULT_ASSIGNED_AT.toString()));
    }

    @Test
    @Transactional
    void getNonExistingBooking() throws Exception {
        // Get the booking
        restBookingMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingBooking() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the booking
        Booking updatedBooking = bookingRepository.findById(booking.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedBooking are not directly saved in db
        em.detach(updatedBooking);
        updatedBooking
            .activityType(UPDATED_ACTIVITY_TYPE)
            .eventType(UPDATED_EVENT_TYPE)
            .bookingDate(UPDATED_BOOKING_DATE)
            .partySize(UPDATED_PARTY_SIZE)
            .bookingStatus(UPDATED_BOOKING_STATUS)
            .createdAt(UPDATED_CREATED_AT)
            .assignedAt(UPDATED_ASSIGNED_AT);

        restBookingMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedBooking.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedBooking))
            )
            .andExpect(status().isOk());

        // Validate the Booking in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedBookingToMatchAllProperties(updatedBooking);
    }

    @Test
    @Transactional
    void putNonExistingBooking() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        booking.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restBookingMockMvc
            .perform(put(ENTITY_API_URL_ID, booking.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(booking)))
            .andExpect(status().isBadRequest());

        // Validate the Booking in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchBooking() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        booking.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restBookingMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(booking))
            )
            .andExpect(status().isBadRequest());

        // Validate the Booking in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamBooking() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        booking.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restBookingMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(booking)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Booking in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateBookingWithPatch() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the booking using partial update
        Booking partialUpdatedBooking = new Booking();
        partialUpdatedBooking.setId(booking.getId());

        partialUpdatedBooking.activityType(UPDATED_ACTIVITY_TYPE).createdAt(UPDATED_CREATED_AT);

        restBookingMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedBooking.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedBooking))
            )
            .andExpect(status().isOk());

        // Validate the Booking in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertBookingUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedBooking, booking), getPersistedBooking(booking));
    }

    @Test
    @Transactional
    void fullUpdateBookingWithPatch() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the booking using partial update
        Booking partialUpdatedBooking = new Booking();
        partialUpdatedBooking.setId(booking.getId());

        partialUpdatedBooking
            .activityType(UPDATED_ACTIVITY_TYPE)
            .eventType(UPDATED_EVENT_TYPE)
            .bookingDate(UPDATED_BOOKING_DATE)
            .partySize(UPDATED_PARTY_SIZE)
            .bookingStatus(UPDATED_BOOKING_STATUS)
            .createdAt(UPDATED_CREATED_AT)
            .assignedAt(UPDATED_ASSIGNED_AT);

        restBookingMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedBooking.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedBooking))
            )
            .andExpect(status().isOk());

        // Validate the Booking in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertBookingUpdatableFieldsEquals(partialUpdatedBooking, getPersistedBooking(partialUpdatedBooking));
    }

    @Test
    @Transactional
    void patchNonExistingBooking() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        booking.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restBookingMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, booking.getId()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(booking))
            )
            .andExpect(status().isBadRequest());

        // Validate the Booking in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchBooking() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        booking.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restBookingMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(booking))
            )
            .andExpect(status().isBadRequest());

        // Validate the Booking in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamBooking() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        booking.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restBookingMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(booking)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Booking in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteBooking() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the booking
        restBookingMockMvc
            .perform(delete(ENTITY_API_URL_ID, booking.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return bookingRepository.count();
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

    protected Booking getPersistedBooking(Booking booking) {
        return bookingRepository.findById(booking.getId()).orElseThrow();
    }

    protected void assertPersistedBookingToMatchAllProperties(Booking expectedBooking) {
        assertBookingAllPropertiesEquals(expectedBooking, getPersistedBooking(expectedBooking));
    }

    protected void assertPersistedBookingToMatchUpdatableProperties(Booking expectedBooking) {
        assertBookingAllUpdatablePropertiesEquals(expectedBooking, getPersistedBooking(expectedBooking));
    }
}
