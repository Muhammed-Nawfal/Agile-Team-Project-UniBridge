package bham.team.domain;

import bham.team.domain.enumeration.ActivityType;
import bham.team.domain.enumeration.Decision;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "user", "booking", "ranking" }, allowSetters = true)
    private Profile userName;

    @ManyToOne(fetch = FetchType.LAZY)
    private User requestUser;

    @ManyToOne(fetch = FetchType.LAZY)
    private User matchedUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "bookings", "userName", "requesteduser" }, allowSetters = true)
    private Activity matchedActivity;

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

    public Profile getUserName() {
        return this.userName;
    }

    public void setUserName(Profile profile) {
        this.userName = profile;
    }

    public ActivityMatch userName(Profile profile) {
        this.setUserName(profile);
        return this;
    }

    public User getRequestUser() {
        return this.requestUser;
    }

    public void setRequestUser(User user) {
        this.requestUser = user;
    }

    public ActivityMatch requestUser(User user) {
        this.setRequestUser(user);
        return this;
    }

    public User getMatchedUser() {
        return this.matchedUser;
    }

    public void setMatchedUser(User user) {
        this.matchedUser = user;
    }

    public ActivityMatch matchedUser(User user) {
        this.setMatchedUser(user);
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
            "}";
    }
}
