package bham.team.domain;

import bham.team.domain.enumeration.ActivityType;
import bham.team.domain.enumeration.Course;
import bham.team.domain.enumeration.GymLocation;
import bham.team.domain.enumeration.PreferredTime;
import bham.team.domain.enumeration.Skill;
import bham.team.domain.enumeration.Sports;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A Profile.
 */
@Entity
@Table(name = "profile")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Profile implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @Column(name = "id")
    private Long id;

    @Lob
    @Column(name = "bio")
    private String bio;

    @Lob
    @Column(name = "profile_picture")
    private byte[] profilePicture;

    @Column(name = "profile_picture_content_type")
    private String profilePictureContentType;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "course", nullable = false)
    private Course course;

    @NotNull
    @Min(value = 1L)
    @Max(value = 6L)
    @Column(name = "course_year", nullable = false)
    private Long courseYear;

    @NotNull
    @Size(min = 1, max = 50)
    @Column(name = "university", length = 50, nullable = false)
    private String university;

    @Enumerated(EnumType.STRING)
    @Column(name = "gym_skill")
    private Skill gymSkill;

    @Enumerated(EnumType.STRING)
    @Column(name = "gym_location")
    private GymLocation gymLocation;

    @Enumerated(EnumType.STRING)
    @Column(name = "gym_time")
    private PreferredTime gymTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "study_time")
    private PreferredTime studyTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "sports")
    private Sports sports;

    @Enumerated(EnumType.STRING)
    @Column(name = "sports_skill")
    private Skill sportsSkill;

    @Enumerated(EnumType.STRING)
    @Column(name = "sports_time")
    private PreferredTime sportsTime;

    @Column(name = "preferred_society")
    private String preferredSociety;

    @Column(name = "preferred_events")
    private String preferredEvents;

    @Enumerated(EnumType.STRING)
    @Column(name = "events_time")
    private PreferredTime eventsTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_activities")
    private ActivityType preferredActivities;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(unique = true)
    private User user;

    @JsonIgnoreProperties(value = { "bookingDoneBy", "requestedUser", "bookedActivity", "activity" }, allowSetters = true)
    @OneToOne(fetch = FetchType.LAZY, mappedBy = "bookingDoneBy")
    private Booking booking;

    @JsonIgnoreProperties(value = { "rankGiven", "user" }, allowSetters = true)
    @OneToOne(fetch = FetchType.LAZY, mappedBy = "rankGiven")
    private Ranking ranking;

    @Transient
    public String getUserFirstName() {
        return this.user != null ? this.user.getFirstName() : null;
    }

    @Transient
    public String getUserLastName() {
        return this.user != null ? this.user.getLastName() : null;
    }

    @Transient
    public String getUserLogin() {
        return this.user != null ? this.user.getLogin() : null;
    }

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Profile id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBio() {
        return this.bio;
    }

    public Profile bio(String bio) {
        this.setBio(bio);
        return this;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public byte[] getProfilePicture() {
        return this.profilePicture;
    }

    public Profile profilePicture(byte[] profilePicture) {
        this.setProfilePicture(profilePicture);
        return this;
    }

    public void setProfilePicture(byte[] profilePicture) {
        this.profilePicture = profilePicture;
    }

    public String getProfilePictureContentType() {
        return this.profilePictureContentType;
    }

    public Profile profilePictureContentType(String profilePictureContentType) {
        this.profilePictureContentType = profilePictureContentType;
        return this;
    }

    public void setProfilePictureContentType(String profilePictureContentType) {
        this.profilePictureContentType = profilePictureContentType;
    }

    public Course getCourse() {
        return this.course;
    }

    public Profile course(Course course) {
        this.setCourse(course);
        return this;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public Long getCourseYear() {
        return this.courseYear;
    }

    public Profile courseYear(Long courseYear) {
        this.setCourseYear(courseYear);
        return this;
    }

    public void setCourseYear(Long courseYear) {
        this.courseYear = courseYear;
    }

    public String getUniversity() {
        return this.university;
    }

    public Profile university(String university) {
        this.setUniversity(university);
        return this;
    }

    public void setUniversity(String university) {
        this.university = university;
    }

    public Skill getGymSkill() {
        return this.gymSkill;
    }

    public Profile gymSkill(Skill gymSkill) {
        this.setGymSkill(gymSkill);
        return this;
    }

    public void setGymSkill(Skill gymSkill) {
        this.gymSkill = gymSkill;
    }

    public GymLocation getGymLocation() {
        return this.gymLocation;
    }

    public Profile gymLocation(GymLocation gymLocation) {
        this.setGymLocation(gymLocation);
        return this;
    }

    public void setGymLocation(GymLocation gymLocation) {
        this.gymLocation = gymLocation;
    }

    public PreferredTime getGymTime() {
        return this.gymTime;
    }

    public Profile gymTime(PreferredTime gymTime) {
        this.setGymTime(gymTime);
        return this;
    }

    public void setGymTime(PreferredTime gymTime) {
        this.gymTime = gymTime;
    }

    public PreferredTime getStudyTime() {
        return this.studyTime;
    }

    public Profile studyTime(PreferredTime studyTime) {
        this.setStudyTime(studyTime);
        return this;
    }

    public void setStudyTime(PreferredTime studyTime) {
        this.studyTime = studyTime;
    }

    public Sports getSports() {
        return this.sports;
    }

    public Profile sports(Sports sports) {
        this.setSports(sports);
        return this;
    }

    public void setSports(Sports sports) {
        this.sports = sports;
    }

    public Skill getSportsSkill() {
        return this.sportsSkill;
    }

    public Profile sportsSkill(Skill sportsSkill) {
        this.setSportsSkill(sportsSkill);
        return this;
    }

    public void setSportsSkill(Skill sportsSkill) {
        this.sportsSkill = sportsSkill;
    }

    public PreferredTime getSportsTime() {
        return this.sportsTime;
    }

    public Profile sportsTime(PreferredTime sportsTime) {
        this.setSportsTime(sportsTime);
        return this;
    }

    public void setSportsTime(PreferredTime sportsTime) {
        this.sportsTime = sportsTime;
    }

    public String getPreferredSociety() {
        return this.preferredSociety;
    }

    public Profile preferredSociety(String preferredSociety) {
        this.setPreferredSociety(preferredSociety);
        return this;
    }

    public void setPreferredSociety(String preferredSociety) {
        this.preferredSociety = preferredSociety;
    }

    public String getPreferredEvents() {
        return this.preferredEvents;
    }

    public Profile preferredEvents(String preferredEvents) {
        this.setPreferredEvents(preferredEvents);
        return this;
    }

    public void setPreferredEvents(String preferredEvents) {
        this.preferredEvents = preferredEvents;
    }

    public PreferredTime getEventsTime() {
        return this.eventsTime;
    }

    public Profile eventsTime(PreferredTime eventsTime) {
        this.setEventsTime(eventsTime);
        return this;
    }

    public void setEventsTime(PreferredTime eventsTime) {
        this.eventsTime = eventsTime;
    }

    public ActivityType getPreferredActivities() {
        return this.preferredActivities;
    }

    public Profile preferredActivities(ActivityType preferredActivities) {
        this.setPreferredActivities(preferredActivities);
        return this;
    }

    public void setPreferredActivities(ActivityType preferredActivities) {
        this.preferredActivities = preferredActivities;
    }

    public User getUser() {
        return this.user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Profile user(User user) {
        this.setUser(user);
        return this;
    }

    public Booking getBooking() {
        return this.booking;
    }

    public void setBooking(Booking booking) {
        if (this.booking != null) {
            this.booking.setBookingDoneBy(null);
        }
        if (booking != null) {
            booking.setBookingDoneBy(this);
        }
        this.booking = booking;
    }

    public Profile booking(Booking booking) {
        this.setBooking(booking);
        return this;
    }

    public Ranking getRanking() {
        return this.ranking;
    }

    public void setRanking(Ranking ranking) {
        if (this.ranking != null) {
            this.ranking.setRankGiven(null);
        }
        if (ranking != null) {
            ranking.setRankGiven(this);
        }
        this.ranking = ranking;
    }

    public Profile ranking(Ranking ranking) {
        this.setRanking(ranking);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Profile)) {
            return false;
        }
        return getId() != null && getId().equals(((Profile) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Profile{" +
            "id=" + getId() +
            ", userLogin='" + getUserLogin() + "'" +
            ", userFirstName='" + getUserFirstName() + "'" +
            ", userLastName='" + getUserLastName() + "'" +
            ", bio='" + getBio() + "'" +
            ", profilePicture='" + getProfilePicture() + "'" +
            ", profilePictureContentType='" + getProfilePictureContentType() + "'" +
            ", course='" + getCourse() + "'" +
            ", courseYear=" + getCourseYear() +
            ", university='" + getUniversity() + "'" +
            ", gymSkill='" + getGymSkill() + "'" +
            ", gymLocation='" + getGymLocation() + "'" +
            ", gymTime='" + getGymTime() + "'" +
            ", studyTime='" + getStudyTime() + "'" +
            ", sports='" + getSports() + "'" +
            ", sportsSkill='" + getSportsSkill() + "'" +
            ", sportsTime='" + getSportsTime() + "'" +
            ", preferredSociety='" + getPreferredSociety() + "'" +
            ", preferredEvents='" + getPreferredEvents() + "'" +
            ", eventsTime='" + getEventsTime() + "'" +
            ", preferredActivities='" + getPreferredActivities() + "'" +
            "}";
    }
}
