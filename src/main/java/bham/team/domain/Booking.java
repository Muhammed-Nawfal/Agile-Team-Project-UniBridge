package bham.team.domain;

import bham.team.domain.enumeration.ActivityType;
import bham.team.domain.enumeration.BookingStatus;
import bham.team.domain.enumeration.EventType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A Booking.
 */
@Entity
@Table(name = "booking")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Booking implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", nullable = false)
    private ActivityType activityType;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private EventType eventType;

    @NotNull
    @Column(name = "booking_date", nullable = false)
    private LocalDate bookingDate;

    @NotNull
    @Column(name = "party_size", nullable = false)
    private Integer partySize;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "booking_status", nullable = false)
    private BookingStatus bookingStatus;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "assigned_at")
    private Instant assignedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "bookingsLists", "event" }, allowSetters = true)
    private TimeSlot timeSlots;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "bookings", "creator", "challenge" }, allowSetters = true)
    private Activity bookedActivity;

    @ManyToOne(fetch = FetchType.LAZY)
    private Location bookingLocation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "user", "ranking", "messageThreads" }, allowSetters = true)
    private Profile creator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "bookings", "creator", "challenge" }, allowSetters = true)
    private Activity activity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "bookingsLists", "event" }, allowSetters = true)
    private TimeSlot timeSlot;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Booking id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ActivityType getActivityType() {
        return this.activityType;
    }

    public Booking activityType(ActivityType activityType) {
        this.setActivityType(activityType);
        return this;
    }

    public void setActivityType(ActivityType activityType) {
        this.activityType = activityType;
    }

    public EventType getEventType() {
        return this.eventType;
    }

    public Booking eventType(EventType eventType) {
        this.setEventType(eventType);
        return this;
    }

    public void setEventType(EventType eventType) {
        this.eventType = eventType;
    }

    public LocalDate getBookingDate() {
        return this.bookingDate;
    }

    public Booking bookingDate(LocalDate bookingDate) {
        this.setBookingDate(bookingDate);
        return this;
    }

    public void setBookingDate(LocalDate bookingDate) {
        this.bookingDate = bookingDate;
    }

    public Integer getPartySize() {
        return this.partySize;
    }

    public Booking partySize(Integer partySize) {
        this.setPartySize(partySize);
        return this;
    }

    public void setPartySize(Integer partySize) {
        this.partySize = partySize;
    }

    public BookingStatus getBookingStatus() {
        return this.bookingStatus;
    }

    public Booking bookingStatus(BookingStatus bookingStatus) {
        this.setBookingStatus(bookingStatus);
        return this;
    }

    public void setBookingStatus(BookingStatus bookingStatus) {
        this.bookingStatus = bookingStatus;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public Booking createdAt(Instant createdAt) {
        this.setCreatedAt(createdAt);
        return this;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getAssignedAt() {
        return this.assignedAt;
    }

    public Booking assignedAt(Instant assignedAt) {
        this.setAssignedAt(assignedAt);
        return this;
    }

    public void setAssignedAt(Instant assignedAt) {
        this.assignedAt = assignedAt;
    }

    public TimeSlot getTimeSlots() {
        return this.timeSlots;
    }

    public void setTimeSlots(TimeSlot timeSlot) {
        this.timeSlots = timeSlot;
    }

    public Booking timeSlots(TimeSlot timeSlot) {
        this.setTimeSlots(timeSlot);
        return this;
    }

    public Activity getBookedActivity() {
        return this.bookedActivity;
    }

    public void setBookedActivity(Activity activity) {
        this.bookedActivity = activity;
    }

    public Booking bookedActivity(Activity activity) {
        this.setBookedActivity(activity);
        return this;
    }

    public Location getBookingLocation() {
        return this.bookingLocation;
    }

    public void setBookingLocation(Location location) {
        this.bookingLocation = location;
    }

    public Booking bookingLocation(Location location) {
        this.setBookingLocation(location);
        return this;
    }

    public Profile getCreator() {
        return this.creator;
    }

    public void setCreator(Profile profile) {
        this.creator = profile;
    }

    public Booking creator(Profile profile) {
        this.setCreator(profile);
        return this;
    }

    public Activity getActivity() {
        return this.activity;
    }

    public void setActivity(Activity activity) {
        this.activity = activity;
    }

    public Booking activity(Activity activity) {
        this.setActivity(activity);
        return this;
    }

    public TimeSlot getTimeSlot() {
        return this.timeSlot;
    }

    public void setTimeSlot(TimeSlot timeSlot) {
        this.timeSlot = timeSlot;
    }

    public Booking timeSlot(TimeSlot timeSlot) {
        this.setTimeSlot(timeSlot);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Booking)) {
            return false;
        }
        return getId() != null && getId().equals(((Booking) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Booking{" +
            "id=" + getId() +
            ", activityType='" + getActivityType() + "'" +
            ", eventType='" + getEventType() + "'" +
            ", bookingDate='" + getBookingDate() + "'" +
            ", partySize=" + getPartySize() +
            ", bookingStatus='" + getBookingStatus() + "'" +
            ", createdAt='" + getCreatedAt() + "'" +
            ", assignedAt='" + getAssignedAt() + "'" +
            "}";
    }
}
