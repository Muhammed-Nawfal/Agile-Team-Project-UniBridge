package bham.team.domain;

import bham.team.domain.enumeration.ActivityType;
import bham.team.domain.enumeration.Decision;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A ActivityMatch.
 */
@Entity
@Table(name = "activity_match")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ActivityMatch implements Serializable {

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
    @Column(name = "status", nullable = false)
    private Decision status;

    @NotNull
    @Column(name = "match_date", nullable = false)
    private LocalDate matchDate;

    @NotNull
    @Column(name = "match_time", nullable = false)
    private Instant matchTime;

    @Size(max = 100)
    @Column(name = "location", length = 100)
    private String location;

    @Lob
    @Column(name = "notes")
    private String notes;

    @NotNull
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @NotNull
    @Column(name = "response_at", nullable = false)
    private Instant responseAt;

    @JsonIgnoreProperties(value = { "rankGiven", "activityMatch" }, allowSetters = true)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(unique = true)
    private Ranking ratings;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "user", "ranking", "messageThreads" }, allowSetters = true)
    private Profile matchRequestor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JsonIgnoreProperties(value = { "user", "ranking", "messageThreads" }, allowSetters = true)
    private Profile userDetails;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "bookings", "creator", "challenge" }, allowSetters = true)
    private Activity matchedActivity;

    @JsonIgnoreProperties(value = { "friendChat", "matchChat", "messages", "participants" }, allowSetters = true)
    @OneToOne(fetch = FetchType.LAZY, mappedBy = "matchChat")
    private MessageThread messageThread;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public ActivityMatch id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ActivityType getActivityType() {
        return this.activityType;
    }

    public ActivityMatch activityType(ActivityType activityType) {
        this.setActivityType(activityType);
        return this;
    }

    public void setActivityType(ActivityType activityType) {
        this.activityType = activityType;
    }

    public Decision getStatus() {
        return this.status;
    }

    public ActivityMatch status(Decision status) {
        this.setStatus(status);
        return this;
    }

    public void setStatus(Decision status) {
        this.status = status;
    }

    public LocalDate getMatchDate() {
        return this.matchDate;
    }

    public ActivityMatch matchDate(LocalDate matchDate) {
        this.setMatchDate(matchDate);
        return this;
    }

    public void setMatchDate(LocalDate matchDate) {
        this.matchDate = matchDate;
    }

    public Instant getMatchTime() {
        return this.matchTime;
    }

    public ActivityMatch matchTime(Instant matchTime) {
        this.setMatchTime(matchTime);
        return this;
    }

    public void setMatchTime(Instant matchTime) {
        this.matchTime = matchTime;
    }

    public String getLocation() {
        return this.location;
    }

    public ActivityMatch location(String location) {
        this.setLocation(location);
        return this;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getNotes() {
        return this.notes;
    }

    public ActivityMatch notes(String notes) {
        this.setNotes(notes);
        return this;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public ActivityMatch createdAt(Instant createdAt) {
        this.setCreatedAt(createdAt);
        return this;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getResponseAt() {
        return this.responseAt;
    }

    public ActivityMatch responseAt(Instant responseAt) {
        this.setResponseAt(responseAt);
        return this;
    }

    public void setResponseAt(Instant responseAt) {
        this.responseAt = responseAt;
    }

    public Ranking getRatings() {
        return this.ratings;
    }

    public void setRatings(Ranking ranking) {
        this.ratings = ranking;
    }

    public ActivityMatch ratings(Ranking ranking) {
        this.setRatings(ranking);
        return this;
    }

    public Profile getMatchRequestor() {
        return this.matchRequestor;
    }

    public void setMatchRequestor(Profile profile) {
        this.matchRequestor = profile;
    }

    public ActivityMatch matchRequestor(Profile profile) {
        this.setMatchRequestor(profile);
        return this;
    }

    public Profile getUserDetails() {
        return this.userDetails;
    }

    public void setUserDetails(Profile profile) {
        this.userDetails = profile;
    }

    public ActivityMatch userDetails(Profile profile) {
        this.setUserDetails(profile);
        return this;
    }

    public Activity getMatchedActivity() {
        return this.matchedActivity;
    }

    public void setMatchedActivity(Activity activity) {
        this.matchedActivity = activity;
    }

    public ActivityMatch matchedActivity(Activity activity) {
        this.setMatchedActivity(activity);
        return this;
    }

    public MessageThread getMessageThread() {
        return this.messageThread;
    }

    public void setMessageThread(MessageThread messageThread) {
        if (this.messageThread != null) {
            this.messageThread.setMatchChat(null);
        }
        if (messageThread != null) {
            messageThread.setMatchChat(this);
        }
        this.messageThread = messageThread;
    }

    public ActivityMatch messageThread(MessageThread messageThread) {
        this.setMessageThread(messageThread);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ActivityMatch)) {
            return false;
        }
        return getId() != null && getId().equals(((ActivityMatch) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ActivityMatch{" +
            "id=" + getId() +
            ", activityType='" + getActivityType() + "'" +
            ", status='" + getStatus() + "'" +
            ", matchDate='" + getMatchDate() + "'" +
            ", matchTime='" + getMatchTime() + "'" +
            ", location='" + getLocation() + "'" +
            ", notes='" + getNotes() + "'" +
            ", createdAt='" + getCreatedAt() + "'" +
            ", responseAt='" + getResponseAt() + "'" +
            "}";
    }
}
