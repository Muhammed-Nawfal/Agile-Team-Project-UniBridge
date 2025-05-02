package bham.team.domain;

import bham.team.domain.enumeration.AvailabilityStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A TimeSlot.
 */
@Entity
@Table(name = "time_slot")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class TimeSlot implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "date", nullable = false)
    private LocalDate date;

    @NotNull
    @Column(name = "start_hour", nullable = false)
    private Integer startHour;

    @NotNull
    @Column(name = "end_hour", nullable = false)
    private Integer endHour;

    @NotNull
    @Column(name = "capacity", nullable = false)
    private Integer capacity;

    @Column(name = "remaining_capacity")
    private Integer remainingCapacity;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AvailabilityStatus status;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "timeSlot")
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonIgnoreProperties(value = { "bookedActivity", "bookingLocation", "creator", "activity", "timeSlot" }, allowSetters = true)
    private Set<Booking> bookingsLists = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "timeSlots", "bookedActivity", "bookingLocation", "creator", "activity" }, allowSetters = true)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "timeSlots" }, allowSetters = true)
    private Location location;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public TimeSlot id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDate() {
        return this.date;
    }

    public TimeSlot date(LocalDate date) {
        this.setDate(date);
        return this;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Integer getStartHour() {
        return this.startHour;
    }

    public TimeSlot startHour(Integer startHour) {
        this.setStartHour(startHour);
        return this;
    }

    public void setStartHour(Integer startHour) {
        this.startHour = startHour;
    }

    public Integer getEndHour() {
        return this.endHour;
    }

    public TimeSlot endHour(Integer endHour) {
        this.setEndHour(endHour);
        return this;
    }

    public void setEndHour(Integer endHour) {
        this.endHour = endHour;
    }

    public Integer getCapacity() {
        return this.capacity;
    }

    public TimeSlot capacity(Integer capacity) {
        this.setCapacity(capacity);
        return this;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public Integer getRemainingCapacity() {
        return this.remainingCapacity;
    }

    public TimeSlot remainingCapacity(Integer remainingCapacity) {
        this.setRemainingCapacity(remainingCapacity);
        return this;
    }

    public void setRemainingCapacity(Integer remainingCapacity) {
        this.remainingCapacity = remainingCapacity;
    }

    public AvailabilityStatus getStatus() {
        return this.status;
    }

    public TimeSlot status(AvailabilityStatus status) {
        this.setStatus(status);
        return this;
    }

    public void setStatus(AvailabilityStatus status) {
        this.status = status;
    }

    public Set<Booking> getBookingsLists() {
        return this.bookingsLists;
    }

    public void setBookingsLists(Set<Booking> bookings) {
        if (this.bookingsLists != null) {
            this.bookingsLists.forEach(i -> i.setTimeSlot(null));
        }
        if (bookings != null) {
            bookings.forEach(i -> i.setTimeSlot(this));
        }
        this.bookingsLists = bookings;
    }

    public TimeSlot bookingsLists(Set<Booking> bookings) {
        this.setBookingsLists(bookings);
        return this;
    }

    public TimeSlot addBookingsList(Booking booking) {
        this.bookingsLists.add(booking);
        booking.setTimeSlot(this);
        return this;
    }

    public TimeSlot removeBookingsList(Booking booking) {
        this.bookingsLists.remove(booking);
        booking.setTimeSlot(null);
        return this;
    }

    public Event getEvent() {
        return this.event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public TimeSlot event(Event event) {
        this.setEvent(event);
        return this;
    }

    public Booking getBooking() {
        return this.booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public TimeSlot booking(Booking booking) {
        this.setBooking(booking);
        return this;
    }

    public Location getLocation() {
        return this.location;
    }

    public void setLocation(Location location) {
        this.location = location;
    }

    public TimeSlot location(Location location) {
        this.setLocation(location);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof TimeSlot)) {
            return false;
        }
        return getId() != null && getId().equals(((TimeSlot) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "TimeSlot{" +
            "id=" + getId() +
            ", date='" + getDate() + "'" +
            ", startHour=" + getStartHour() +
            ", endHour=" + getEndHour() +
            ", capacity=" + getCapacity() +
            ", remainingCapacity=" + getRemainingCapacity() +
            ", status='" + getStatus() + "'" +
            ", locationId=" + (getLocation() != null ? getLocation().getId() : "null") +
            "}";
    }
}
