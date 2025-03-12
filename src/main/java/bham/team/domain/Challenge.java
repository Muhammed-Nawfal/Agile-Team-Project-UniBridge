package bham.team.domain;

import bham.team.domain.enumeration.AchievementCategory;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
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

    @NotNull
    @Size(min = 3, max = 100)
    @Column(name = "title", length = 100, nullable = false)
    private String title;

    @Lob
    @Column(name = "description", nullable = false)
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private AchievementCategory category;

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
    @Column(name = "created_date", nullable = false)
    private Instant createdDate;

    @Column(name = "expiry_date")
    private Instant expiryDate;

    @NotNull
    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted;

    @Column(name = "completed_date")
    private Instant completedDate;

    @Column(name = "is_displayed")
    private Boolean isDisplayed;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "user", "booking", "ranking" }, allowSetters = true)
    private Profile challenges;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "friends", "user", "friend", "chat" }, allowSetters = true)
    private FriendsList challengedFriend;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "bookings", "userName", "requesteduser" }, allowSetters = true)
    private Activity challengedActivity;

    @ManyToOne(fetch = FetchType.LAZY)
    private User creator;

    @ManyToOne(fetch = FetchType.LAZY)
    private User recipient;

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

    public AchievementCategory getCategory() {
        return this.category;
    }

    public Challenge category(AchievementCategory category) {
        this.setCategory(category);
        return this;
    }

    public void setCategory(AchievementCategory category) {
        this.category = category;
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

    public Instant getCreatedDate() {
        return this.createdDate;
    }

    public Challenge createdDate(Instant createdDate) {
        this.setCreatedDate(createdDate);
        return this;
    }

    public void setCreatedDate(Instant createdDate) {
        this.createdDate = createdDate;
    }

    public Instant getExpiryDate() {
        return this.expiryDate;
    }

    public Challenge expiryDate(Instant expiryDate) {
        this.setExpiryDate(expiryDate);
        return this;
    }

    public void setExpiryDate(Instant expiryDate) {
        this.expiryDate = expiryDate;
    }

    public Boolean getIsCompleted() {
        return this.isCompleted;
    }

    public Challenge isCompleted(Boolean isCompleted) {
        this.setIsCompleted(isCompleted);
        return this;
    }

    public void setIsCompleted(Boolean isCompleted) {
        this.isCompleted = isCompleted;
    }

    public Instant getCompletedDate() {
        return this.completedDate;
    }

    public Challenge completedDate(Instant completedDate) {
        this.setCompletedDate(completedDate);
        return this;
    }

    public void setCompletedDate(Instant completedDate) {
        this.completedDate = completedDate;
    }

    public Boolean getIsDisplayed() {
        return this.isDisplayed;
    }

    public Challenge isDisplayed(Boolean isDisplayed) {
        this.setIsDisplayed(isDisplayed);
        return this;
    }

    public void setIsDisplayed(Boolean isDisplayed) {
        this.isDisplayed = isDisplayed;
    }

    public Profile getChallenges() {
        return this.challenges;
    }

    public void setChallenges(Profile profile) {
        this.challenges = profile;
    }

    public Challenge challenges(Profile profile) {
        this.setChallenges(profile);
        return this;
    }

    public FriendsList getChallengedFriend() {
        return this.challengedFriend;
    }

    public void setChallengedFriend(FriendsList friendsList) {
        this.challengedFriend = friendsList;
    }

    public Challenge challengedFriend(FriendsList friendsList) {
        this.setChallengedFriend(friendsList);
        return this;
    }

    public Activity getChallengedActivity() {
        return this.challengedActivity;
    }

    public void setChallengedActivity(Activity activity) {
        this.challengedActivity = activity;
    }

    public Challenge challengedActivity(Activity activity) {
        this.setChallengedActivity(activity);
        return this;
    }

    public User getCreator() {
        return this.creator;
    }

    public void setCreator(User user) {
        this.creator = user;
    }

    public Challenge creator(User user) {
        this.setCreator(user);
        return this;
    }

    public User getRecipient() {
        return this.recipient;
    }

    public void setRecipient(User user) {
        this.recipient = user;
    }

    public Challenge recipient(User user) {
        this.setRecipient(user);
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
            ", points=" + getPoints() +
            ", badge='" + getBadge() + "'" +
            ", badgeContentType='" + getBadgeContentType() + "'" +
            ", createdDate='" + getCreatedDate() + "'" +
            ", expiryDate='" + getExpiryDate() + "'" +
            ", isCompleted='" + getIsCompleted() + "'" +
            ", completedDate='" + getCompletedDate() + "'" +
            ", isDisplayed='" + getIsDisplayed() + "'" +
            "}";
    }
}
