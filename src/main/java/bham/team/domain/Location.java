package bham.team.domain;

import bham.team.domain.enumeration.AvailabilityStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A Location.
 */
@Entity
@Table(name = "location")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Location implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "name", nullable = false)
    private String name;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AvailabilityStatus status;

    @NotNull
    @Column(name = "capacity", nullable = false)
    private Integer capacity;

    @Column(name = "remaining_capacity")
    private Integer remainingCapacity;

    @NotNull
    @Column(name = "is_capacity_based", nullable = false)
    private Boolean isCapacityBased;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Location id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public Location name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public AvailabilityStatus getStatus() {
        return this.status;
    }

    public Location status(AvailabilityStatus status) {
        this.setStatus(status);
        return this;
    }

    public void setStatus(AvailabilityStatus status) {
        this.status = status;
    }

    public Integer getCapacity() {
        return this.capacity;
    }

    public Location capacity(Integer capacity) {
        this.setCapacity(capacity);
        return this;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public Integer getRemainingCapacity() {
        return this.remainingCapacity;
    }

    public Location remainingCapacity(Integer remainingCapacity) {
        this.setRemainingCapacity(remainingCapacity);
        return this;
    }

    public void setRemainingCapacity(Integer remainingCapacity) {
        this.remainingCapacity = remainingCapacity;
    }

    public Boolean getIsCapacityBased() {
        return this.isCapacityBased;
    }

    public Location isCapacityBased(Boolean isCapacityBased) {
        this.setIsCapacityBased(isCapacityBased);
        return this;
    }

    public void setIsCapacityBased(Boolean isCapacityBased) {
        this.isCapacityBased = isCapacityBased;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Location)) {
            return false;
        }
        return getId() != null && getId().equals(((Location) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Location{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", status='" + getStatus() + "'" +
            ", capacity=" + getCapacity() +
            ", remainingCapacity=" + getRemainingCapacity() +
            ", isCapacityBased='" + getIsCapacityBased() + "'" +
            "}";
    }
}
