package bham.team.domain;

import bham.team.domain.enumeration.BookingType;
import bham.team.domain.enumeration.Status;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
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
    @Column(name = "booking_name", nullable = false)
    private String bookingName;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "booking_status", nullable = false)
    private Status bookingStatus;

    @NotNull
    @Column(name = "booking_time", nullable = false)
    private Instant bookingTime;

    @NotNull
    @Column(name = "booking_date", nullable = false)
    private Instant bookingDate;

    @NotNull
    @Size(min = 11, max = 11)
    @Column(name = "phone_num", length = 11, nullable = false)
    private String phoneNum;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "booking_type", nullable = false)
    private BookingType bookingType;

    @NotNull
    @Min(value = 1)
    @Column(name = "num_of_participants", nullable = false)
    private Integer numOfParticipants;

    @NotNull
    @Column(name = "book_start_time", nullable = false)
    private Instant bookStartTime;

    @NotNull
    @Column(name = "book_end_time", nullable = false)
    private Instant bookEndTime;

    @ManyToOne(fetch = FetchType.LAZY)
    private User requestedUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "bookings", "requesteduser" }, allowSetters = true)
    private Activity activity;

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

    public String getBookingName() {
        return this.bookingName;
    }

    public Booking bookingName(String bookingName) {
        this.setBookingName(bookingName);
        return this;
    }

    public void setBookingName(String bookingName) {
        this.bookingName = bookingName;
    }

    public Status getBookingStatus() {
        return this.bookingStatus;
    }

    public Booking bookingStatus(Status bookingStatus) {
        this.setBookingStatus(bookingStatus);
        return this;
    }

    public void setBookingStatus(Status bookingStatus) {
        this.bookingStatus = bookingStatus;
    }

    public Instant getBookingTime() {
        return this.bookingTime;
    }

    public Booking bookingTime(Instant bookingTime) {
        this.setBookingTime(bookingTime);
        return this;
    }

    public void setBookingTime(Instant bookingTime) {
        this.bookingTime = bookingTime;
    }

    public Instant getBookingDate() {
        return this.bookingDate;
    }

    public Booking bookingDate(Instant bookingDate) {
        this.setBookingDate(bookingDate);
        return this;
    }

    public void setBookingDate(Instant bookingDate) {
        this.bookingDate = bookingDate;
    }

    public String getPhoneNum() {
        return this.phoneNum;
    }

    public Booking phoneNum(String phoneNum) {
        this.setPhoneNum(phoneNum);
        return this;
    }

    public void setPhoneNum(String phoneNum) {
        this.phoneNum = phoneNum;
    }

    public BookingType getBookingType() {
        return this.bookingType;
    }

    public Booking bookingType(BookingType bookingType) {
        this.setBookingType(bookingType);
        return this;
    }

    public void setBookingType(BookingType bookingType) {
        this.bookingType = bookingType;
    }

    public Integer getNumOfParticipants() {
        return this.numOfParticipants;
    }

    public Booking numOfParticipants(Integer numOfParticipants) {
        this.setNumOfParticipants(numOfParticipants);
        return this;
    }

    public void setNumOfParticipants(Integer numOfParticipants) {
        this.numOfParticipants = numOfParticipants;
    }

    public Instant getBookStartTime() {
        return this.bookStartTime;
    }

    public Booking bookStartTime(Instant bookStartTime) {
        this.setBookStartTime(bookStartTime);
        return this;
    }

    public void setBookStartTime(Instant bookStartTime) {
        this.bookStartTime = bookStartTime;
    }

    public Instant getBookEndTime() {
        return this.bookEndTime;
    }

    public Booking bookEndTime(Instant bookEndTime) {
        this.setBookEndTime(bookEndTime);
        return this;
    }

    public void setBookEndTime(Instant bookEndTime) {
        this.bookEndTime = bookEndTime;
    }

    public User getRequestedUser() {
        return this.requestedUser;
    }

    public void setRequestedUser(User user) {
        this.requestedUser = user;
    }

    public Booking requestedUser(User user) {
        this.setRequestedUser(user);
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
            ", bookingName='" + getBookingName() + "'" +
            ", bookingStatus='" + getBookingStatus() + "'" +
            ", bookingTime='" + getBookingTime() + "'" +
            ", bookingDate='" + getBookingDate() + "'" +
            ", phoneNum='" + getPhoneNum() + "'" +
            ", bookingType='" + getBookingType() + "'" +
            ", numOfParticipants=" + getNumOfParticipants() +
            ", bookStartTime='" + getBookStartTime() + "'" +
            ", bookEndTime='" + getBookEndTime() + "'" +
            "}";
    }
}
