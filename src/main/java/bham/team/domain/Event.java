package bham.team.domain;

import bham.team.domain.enumeration.ActivityType;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A Event.
 */
@Entity
@Table(name = "event")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Event implements Serializable {

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
    @Column(name = "value", nullable = false)
    private String value;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", nullable = false)
    private ActivityType activityType;

    @NotNull
    @Column(name = "min_size", nullable = false)
    private Integer minSize;

    @NotNull
    @Column(name = "max_size", nullable = false)
    private Integer maxSize;

    @Column(name = "start_time")
    private Integer startTime;

    @Column(name = "end_time")
    private Integer endTime;

    @Column(name = "capacity")
    private Integer capacity;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Event id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public Event name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getValue() {
        return this.value;
    }

    public Event value(String value) {
        this.setValue(value);
        return this;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public ActivityType getActivityType() {
        return this.activityType;
    }

    public Event activityType(ActivityType activityType) {
        this.setActivityType(activityType);
        return this;
    }

    public void setActivityType(ActivityType activityType) {
        this.activityType = activityType;
    }

    public Integer getMinSize() {
        return this.minSize;
    }

    public Event minSize(Integer minSize) {
        this.setMinSize(minSize);
        return this;
    }

    public void setMinSize(Integer minSize) {
        this.minSize = minSize;
    }

    public Integer getMaxSize() {
        return this.maxSize;
    }

    public Event maxSize(Integer maxSize) {
        this.setMaxSize(maxSize);
        return this;
    }

    public void setMaxSize(Integer maxSize) {
        this.maxSize = maxSize;
    }

    public Integer getStartTime() {
        return this.startTime;
    }

    public Event startTime(Integer startTime) {
        this.setStartTime(startTime);
        return this;
    }

    public void setStartTime(Integer startTime) {
        this.startTime = startTime;
    }

    public Integer getEndTime() {
        return this.endTime;
    }

    public Event endTime(Integer endTime) {
        this.setEndTime(endTime);
        return this;
    }

    public void setEndTime(Integer endTime) {
        this.endTime = endTime;
    }

    public Integer getCapacity() {
        return this.capacity;
    }

    public Event capacity(Integer capacity) {
        this.setCapacity(capacity);
        return this;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Event)) {
            return false;
        }
        return getId() != null && getId().equals(((Event) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Event{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", value='" + getValue() + "'" +
            ", activityType='" + getActivityType() + "'" +
            ", minSize=" + getMinSize() +
            ", maxSize=" + getMaxSize() +
            ", startTime=" + getStartTime() +
            ", endTime=" + getEndTime() +
            ", capacity=" + getCapacity() +
            "}";
    }
}
