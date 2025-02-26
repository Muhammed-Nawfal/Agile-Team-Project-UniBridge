package bham.team.domain;

import bham.team.domain.enumeration.ActionType;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A Action.
 */
@Entity
@Table(name = "action")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Action implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private ActionType type;

    @NotNull
    @Column(name = "timestamp", nullable = false)
    private Instant timestamp;

    @ManyToOne(fetch = FetchType.LAZY)
    private User performedByID;

    @ManyToOne(fetch = FetchType.LAZY)
    private User targetUserID;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Action id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ActionType getType() {
        return this.type;
    }

    public Action type(ActionType type) {
        this.setType(type);
        return this;
    }

    public void setType(ActionType type) {
        this.type = type;
    }

    public Instant getTimestamp() {
        return this.timestamp;
    }

    public Action timestamp(Instant timestamp) {
        this.setTimestamp(timestamp);
        return this;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public User getPerformedByID() {
        return this.performedByID;
    }

    public void setPerformedByID(User user) {
        this.performedByID = user;
    }

    public Action performedByID(User user) {
        this.setPerformedByID(user);
        return this;
    }

    public User getTargetUserID() {
        return this.targetUserID;
    }

    public void setTargetUserID(User user) {
        this.targetUserID = user;
    }

    public Action targetUserID(User user) {
        this.setTargetUserID(user);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Action)) {
            return false;
        }
        return getId() != null && getId().equals(((Action) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Action{" +
            "id=" + getId() +
            ", type='" + getType() + "'" +
            ", timestamp='" + getTimestamp() + "'" +
            "}";
    }
}
