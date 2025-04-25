package bham.team.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A Review.
 */
@Entity
@Table(name = "review")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Review implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "date_published", nullable = false)
    private Instant datePublished;

    @NotNull
    @DecimalMin(value = "0")
    @DecimalMax(value = "5")
    @Column(name = "star", precision = 21, scale = 2, nullable = false)
    private BigDecimal star;

    @Size(min = 0, max = 300)
    @Column(name = "text", length = 300)
    private String text;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "user", "ranking", "messageThreads" }, allowSetters = true)
    private Profile aboutUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "user", "ranking", "messageThreads" }, allowSetters = true)
    private Profile fromUser;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Review id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Instant getDatePublished() {
        return this.datePublished;
    }

    public Review datePublished(Instant datePublished) {
        this.setDatePublished(datePublished);
        return this;
    }

    public void setDatePublished(Instant datePublished) {
        this.datePublished = datePublished;
    }

    public BigDecimal getStar() {
        return this.star;
    }

    public Review star(BigDecimal star) {
        this.setStar(star);
        return this;
    }

    public void setStar(BigDecimal star) {
        this.star = star;
    }

    public String getText() {
        return this.text;
    }

    public Review text(String text) {
        this.setText(text);
        return this;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Profile getAboutUser() {
        return this.aboutUser;
    }

    public void setAboutUser(Profile profile) {
        this.aboutUser = profile;
    }

    public Review aboutUser(Profile profile) {
        this.setAboutUser(profile);
        return this;
    }

    public Profile getFromUser() {
        return this.fromUser;
    }

    public void setFromUser(Profile profile) {
        this.fromUser = profile;
    }

    public Review fromUser(Profile profile) {
        this.setFromUser(profile);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Review)) {
            return false;
        }
        return getId() != null && getId().equals(((Review) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Review{" +
            "id=" + getId() +
            ", datePublished='" + getDatePublished() + "'" +
            ", star=" + getStar() +
            ", text='" + getText() + "'" +
            "}";
    }
}
