package bham.team.domain;

import bham.team.domain.enumeration.ActivityType;
import bham.team.domain.enumeration.IsPaid;
import bham.team.domain.enumeration.Status;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A Activity.
 */
@Entity
@Table(name = "activity")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Activity implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(min = 1, max = 120)
    @Column(name = "activity_name", length = 120, nullable = false)
    private String activityName;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", nullable = false)
    private ActivityType activityType;

    @NotNull
    @Column(name = "activity_date", nullable = false)
    private Instant activityDate;

    @NotNull
    @Column(name = "number_of_participants", nullable = false)
    private Integer numberOfParticipants;

    @NotNull
    @Min(value = 2)
    @Column(name = "max_number_of_participants", nullable = false)
    private Integer maxNumberOfParticipants;

    @NotNull
    @Size(max = 95)
    @Column(name = "location", length = 95, nullable = false)
    private String location;

    @Lob
    @Column(name = "description")
    private String description;

    @NotNull
    @Column(name = "created_on", nullable = false)
    private Instant createdOn;

    @NotNull
    @Column(name = "updated_on", nullable = false)
    private Instant updatedOn;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @Lob
    @Column(name = "cover_image")
    private byte[] coverImage;

    @Column(name = "cover_image_content_type")
    private String coverImageContentType;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "paid", nullable = false)
    private IsPaid paid;

    @NotNull
    @Column(name = "cost_ofactivity", precision = 21, scale = 2, nullable = false)
    private BigDecimal costOfactivity;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "activity")
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonIgnoreProperties(value = { "requestedUser", "activity" }, allowSetters = true)
    private Set<Booking> bookings = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    private User requesteduser;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Activity id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getActivityName() {
        return this.activityName;
    }

    public Activity activityName(String activityName) {
        this.setActivityName(activityName);
        return this;
    }

    public void setActivityName(String activityName) {
        this.activityName = activityName;
    }

    public ActivityType getActivityType() {
        return this.activityType;
    }

    public Activity activityType(ActivityType activityType) {
        this.setActivityType(activityType);
        return this;
    }

    public void setActivityType(ActivityType activityType) {
        this.activityType = activityType;
    }

    public Instant getActivityDate() {
        return this.activityDate;
    }

    public Activity activityDate(Instant activityDate) {
        this.setActivityDate(activityDate);
        return this;
    }

    public void setActivityDate(Instant activityDate) {
        this.activityDate = activityDate;
    }

    public Integer getNumberOfParticipants() {
        return this.numberOfParticipants;
    }

    public Activity numberOfParticipants(Integer numberOfParticipants) {
        this.setNumberOfParticipants(numberOfParticipants);
        return this;
    }

    public void setNumberOfParticipants(Integer numberOfParticipants) {
        this.numberOfParticipants = numberOfParticipants;
    }

    public Integer getMaxNumberOfParticipants() {
        return this.maxNumberOfParticipants;
    }

    public Activity maxNumberOfParticipants(Integer maxNumberOfParticipants) {
        this.setMaxNumberOfParticipants(maxNumberOfParticipants);
        return this;
    }

    public void setMaxNumberOfParticipants(Integer maxNumberOfParticipants) {
        this.maxNumberOfParticipants = maxNumberOfParticipants;
    }

    public String getLocation() {
        return this.location;
    }

    public Activity location(String location) {
        this.setLocation(location);
        return this;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return this.description;
    }

    public Activity description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Instant getCreatedOn() {
        return this.createdOn;
    }

    public Activity createdOn(Instant createdOn) {
        this.setCreatedOn(createdOn);
        return this;
    }

    public void setCreatedOn(Instant createdOn) {
        this.createdOn = createdOn;
    }

    public Instant getUpdatedOn() {
        return this.updatedOn;
    }

    public Activity updatedOn(Instant updatedOn) {
        this.setUpdatedOn(updatedOn);
        return this;
    }

    public void setUpdatedOn(Instant updatedOn) {
        this.updatedOn = updatedOn;
    }

    public Status getStatus() {
        return this.status;
    }

    public Activity status(Status status) {
        this.setStatus(status);
        return this;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public byte[] getCoverImage() {
        return this.coverImage;
    }

    public Activity coverImage(byte[] coverImage) {
        this.setCoverImage(coverImage);
        return this;
    }

    public void setCoverImage(byte[] coverImage) {
        this.coverImage = coverImage;
    }

    public String getCoverImageContentType() {
        return this.coverImageContentType;
    }

    public Activity coverImageContentType(String coverImageContentType) {
        this.coverImageContentType = coverImageContentType;
        return this;
    }

    public void setCoverImageContentType(String coverImageContentType) {
        this.coverImageContentType = coverImageContentType;
    }

    public IsPaid getPaid() {
        return this.paid;
    }

    public Activity paid(IsPaid paid) {
        this.setPaid(paid);
        return this;
    }

    public void setPaid(IsPaid paid) {
        this.paid = paid;
    }

    public BigDecimal getCostOfactivity() {
        return this.costOfactivity;
    }

    public Activity costOfactivity(BigDecimal costOfactivity) {
        this.setCostOfactivity(costOfactivity);
        return this;
    }

    public void setCostOfactivity(BigDecimal costOfactivity) {
        this.costOfactivity = costOfactivity;
    }

    public Set<Booking> getBookings() {
        return this.bookings;
    }

    public void setBookings(Set<Booking> bookings) {
        if (this.bookings != null) {
            this.bookings.forEach(i -> i.setActivity(null));
        }
        if (bookings != null) {
            bookings.forEach(i -> i.setActivity(this));
        }
        this.bookings = bookings;
    }

    public Activity bookings(Set<Booking> bookings) {
        this.setBookings(bookings);
        return this;
    }

    public Activity addBooking(Booking booking) {
        this.bookings.add(booking);
        booking.setActivity(this);
        return this;
    }

    public Activity removeBooking(Booking booking) {
        this.bookings.remove(booking);
        booking.setActivity(null);
        return this;
    }

    public User getRequesteduser() {
        return this.requesteduser;
    }

    public void setRequesteduser(User user) {
        this.requesteduser = user;
    }

    public Activity requesteduser(User user) {
        this.setRequesteduser(user);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Activity)) {
            return false;
        }
        return getId() != null && getId().equals(((Activity) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Activity{" +
            "id=" + getId() +
            ", activityName='" + getActivityName() + "'" +
            ", activityType='" + getActivityType() + "'" +
            ", activityDate='" + getActivityDate() + "'" +
            ", numberOfParticipants=" + getNumberOfParticipants() +
            ", maxNumberOfParticipants=" + getMaxNumberOfParticipants() +
            ", location='" + getLocation() + "'" +
            ", description='" + getDescription() + "'" +
            ", createdOn='" + getCreatedOn() + "'" +
            ", updatedOn='" + getUpdatedOn() + "'" +
            ", status='" + getStatus() + "'" +
            ", coverImage='" + getCoverImage() + "'" +
            ", coverImageContentType='" + getCoverImageContentType() + "'" +
            ", paid='" + getPaid() + "'" +
            ", costOfactivity=" + getCostOfactivity() +
            "}";
    }
}
