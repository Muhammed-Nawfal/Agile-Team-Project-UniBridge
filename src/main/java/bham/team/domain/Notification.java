package bham.team.domain;

import bham.team.domain.enumeration.Notificationstype;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A Notification.
 */
@Entity
@Table(name = "notification")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Notification implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false)
    private Notificationstype notificationType;

    @NotNull
    @Size(min = 1, max = 255)
    @Column(name = "title", length = 255, nullable = false)
    private String title;

    @NotNull
    @Size(min = 1, max = 1000)
    @Column(name = "message", length = 1000, nullable = false)
    private String message;

    @NotNull
    @Column(name = "timestamp", nullable = false)
    private Instant timestamp;

    @NotNull
    @Column(name = "is_read", nullable = false)
    private Boolean isRead;

    @ManyToOne(fetch = FetchType.LAZY)
    private User userID;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Notification id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Notificationstype getNotificationType() {
        return this.notificationType;
    }

    public Notification notificationType(Notificationstype notificationType) {
        this.setNotificationType(notificationType);
        return this;
    }

    public void setNotificationType(Notificationstype notificationType) {
        this.notificationType = notificationType;
    }

    public String getTitle() {
        return this.title;
    }

    public Notification title(String title) {
        this.setTitle(title);
        return this;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return this.message;
    }

    public Notification message(String message) {
        this.setMessage(message);
        return this;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Instant getTimestamp() {
        return this.timestamp;
    }

    public Notification timestamp(Instant timestamp) {
        this.setTimestamp(timestamp);
        return this;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public Boolean getIsRead() {
        return this.isRead;
    }

    public Notification isRead(Boolean isRead) {
        this.setIsRead(isRead);
        return this;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public User getUserID() {
        return this.userID;
    }

    public void setUserID(User user) {
        this.userID = user;
    }

    public Notification userID(User user) {
        this.setUserID(user);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Notification)) {
            return false;
        }
        return getId() != null && getId().equals(((Notification) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Notification{" +
            "id=" + getId() +
            ", notificationType='" + getNotificationType() + "'" +
            ", title='" + getTitle() + "'" +
            ", message='" + getMessage() + "'" +
            ", timestamp='" + getTimestamp() + "'" +
            ", isRead='" + getIsRead() + "'" +
            "}";
    }
}
