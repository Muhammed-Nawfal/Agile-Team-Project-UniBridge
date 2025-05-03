package bham.team.domain;

import bham.team.domain.enumeration.Category;
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
 * A Challenge.
 */
@Entity
@Table(name = "challenge")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Challenge implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull(message = "Title is required")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    @Column(name = "title", length = 100, nullable = false)
    private String title;

    @Lob
    @Column(name = "description", nullable = false)
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private Category category;

    @NotNull
    @Column(name = "date", nullable = false)
    private LocalDate date;

    @NotNull
    @Min(value = 1)
    @Max(value = 100)
    @Column(name = "points", nullable = false)
    private Integer points;

    @Lob
    @Column(name = "badge", nullable = false)
    private byte[] badge;

    @NotNull
    @Column(name = "badge_content_type", nullable = false)
    private String badgeContentType;

    @NotNull
    @Column(name = "completed", nullable = false)
    private Boolean completed;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "challenge")
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonIgnoreProperties(value = { "bookings", "creator", "challenge" }, allowSetters = true)
    private Set<Activity> activities = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "user", "ranking", "messageThreads" }, allowSetters = true)
    private Profile assignedTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "user", "ranking", "messageThreads" }, allowSetters = true)
    private Profile createdBy;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Challenge id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return this.title;
    }

    public Challenge title(String title) {
        this.setTitle(title);
        return this;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return this.description;
    }

    public Challenge description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Category getCategory() {
        return this.category;
    }

    public Challenge category(Category category) {
        this.setCategory(category);
        return this;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public LocalDate getDate() {
        return this.date;
    }

    public Challenge date(LocalDate date) {
        this.setDate(date);
        return this;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Integer getPoints() {
        return this.points;
    }

    public Challenge points(Integer points) {
        this.setPoints(points);
        return this;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public byte[] getBadge() {
        return this.badge;
    }

    public Challenge badge(byte[] badge) {
        this.setBadge(badge);
        return this;
    }

    public void setBadge(byte[] badge) {
        this.badge = badge;
    }

    public String getBadgeContentType() {
        return this.badgeContentType;
    }

    public Challenge badgeContentType(String badgeContentType) {
        this.badgeContentType = badgeContentType;
        return this;
    }

    public void setBadgeContentType(String badgeContentType) {
        this.badgeContentType = badgeContentType;
    }

    public Boolean getCompleted() {
        return this.completed;
    }

    public Challenge completed(Boolean completed) {
        this.setCompleted(completed);
        return this;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }

    public Set<Activity> getActivities() {
        return this.activities;
    }

    public void setActivities(Set<Activity> activities) {
        if (this.activities != null) {
            this.activities.forEach(i -> i.setChallenge(null));
        }
        if (activities != null) {
            activities.forEach(i -> i.setChallenge(this));
        }
        this.activities = activities;
    }

    public Challenge activities(Set<Activity> activities) {
        this.setActivities(activities);
        return this;
    }

    public Challenge addActivities(Activity activity) {
        this.activities.add(activity);
        activity.setChallenge(this);
        return this;
    }

    public Challenge removeActivities(Activity activity) {
        this.activities.remove(activity);
        activity.setChallenge(null);
        return this;
    }

    public Profile getAssignedTo() {
        return this.assignedTo;
    }

    public void setAssignedTo(Profile profile) {
        this.assignedTo = profile;
    }

    public Challenge assignedTo(Profile profile) {
        this.setAssignedTo(profile);
        return this;
    }

    public Profile getCreatedBy() {
        return this.createdBy;
    }

    public void setCreatedBy(Profile profile) {
        this.createdBy = profile;
    }

    public Challenge createdBy(Profile profile) {
        this.setCreatedBy(profile);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Challenge)) {
            return false;
        }
        return getId() != null && getId().equals(((Challenge) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Challenge{" +
            "id=" + getId() +
            ", title='" + getTitle() + "'" +
            ", description='" + getDescription() + "'" +
            ", category='" + getCategory() + "'" +
            ", date='" + getDate() + "'" +
            ", points=" + getPoints() +
            ", badge='" + getBadge() + "'" +
            ", badgeContentType='" + getBadgeContentType() + "'" +
            ", completed='" + getCompleted() + "'" +
            "}";
    }
}
