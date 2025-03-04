package bham.team.domain;

import bham.team.domain.enumeration.Reliability;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A Ranking.
 */
@Entity
@Table(name = "ranking")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Ranking implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "review_number", nullable = false)
    private Integer reviewNumber;

    @NotNull
    @Column(name = "activity_number", nullable = false)
    private Integer activityNumber;

    @NotNull
    @DecimalMin(value = "0")
    @DecimalMax(value = "5")
    @Column(name = "star_average", precision = 21, scale = 2, nullable = false)
    private BigDecimal starAverage;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "reliable", nullable = false)
    private Reliability reliable;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(unique = true)
    private User user;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Ranking id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getReviewNumber() {
        return this.reviewNumber;
    }

    public Ranking reviewNumber(Integer reviewNumber) {
        this.setReviewNumber(reviewNumber);
        return this;
    }

    public void setReviewNumber(Integer reviewNumber) {
        this.reviewNumber = reviewNumber;
    }

    public Integer getActivityNumber() {
        return this.activityNumber;
    }

    public Ranking activityNumber(Integer activityNumber) {
        this.setActivityNumber(activityNumber);
        return this;
    }

    public void setActivityNumber(Integer activityNumber) {
        this.activityNumber = activityNumber;
    }

    public BigDecimal getStarAverage() {
        return this.starAverage;
    }

    public Ranking starAverage(BigDecimal starAverage) {
        this.setStarAverage(starAverage);
        return this;
    }

    public void setStarAverage(BigDecimal starAverage) {
        this.starAverage = starAverage;
    }

    public Reliability getReliable() {
        return this.reliable;
    }

    public Ranking reliable(Reliability reliable) {
        this.setReliable(reliable);
        return this;
    }

    public void setReliable(Reliability reliable) {
        this.reliable = reliable;
    }

    public User getUser() {
        return this.user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Ranking user(User user) {
        this.setUser(user);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Ranking)) {
            return false;
        }
        return getId() != null && getId().equals(((Ranking) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Ranking{" +
            "id=" + getId() +
            ", reviewNumber=" + getReviewNumber() +
            ", activityNumber=" + getActivityNumber() +
            ", starAverage=" + getStarAverage() +
            ", reliable='" + getReliable() + "'" +
            "}";
    }
}
