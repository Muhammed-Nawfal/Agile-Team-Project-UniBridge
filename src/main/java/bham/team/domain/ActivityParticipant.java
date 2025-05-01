package bham.team.domain;

import bham.team.domain.enumeration.ParticipationStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A ActivityParticipant.
 */
@Entity
@Table(name = "activity_participant")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ActivityParticipant implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "joined_date", nullable = false)
    private Instant joinedDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ParticipationStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "user", "ranking", "messageThreads" }, allowSetters = true)
    private Profile participant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "bookings", "creator", "challenge" }, allowSetters = true)
    private Activity activity;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public ActivityParticipant id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Instant getJoinedDate() {
        return this.joinedDate;
    }

    public ActivityParticipant joinedDate(Instant joinedDate) {
        this.setJoinedDate(joinedDate);
        return this;
    }

    public void setJoinedDate(Instant joinedDate) {
        this.joinedDate = joinedDate;
    }

    public ParticipationStatus getStatus() {
        return this.status;
    }

    public ActivityParticipant status(ParticipationStatus status) {
        this.setStatus(status);
        return this;
    }

    public void setStatus(ParticipationStatus status) {
        this.status = status;
    }

    public Profile getParticipant() {
        return this.participant;
    }

    public void setParticipant(Profile profile) {
        this.participant = profile;
    }

    public ActivityParticipant participant(Profile profile) {
        this.setParticipant(profile);
        return this;
    }

    public Activity getActivity() {
        return this.activity;
    }

    public void setActivity(Activity activity) {
        this.activity = activity;
    }

    public ActivityParticipant activity(Activity activity) {
        this.setActivity(activity);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ActivityParticipant)) {
            return false;
        }
        return getId() != null && getId().equals(((ActivityParticipant) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ActivityParticipant{" +
            "id=" + getId() +
            ", joinedDate='" + getJoinedDate() + "'" +
            ", status='" + getStatus() + "'" +
            "}";
    }
}
