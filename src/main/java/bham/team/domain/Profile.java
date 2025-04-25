package bham.team.domain;

import bham.team.domain.enumeration.ActivityType;
import bham.team.domain.enumeration.Course;
import bham.team.domain.enumeration.GymLocation;
import bham.team.domain.enumeration.PreferredEvents;
import bham.team.domain.enumeration.PreferredTime;
import bham.team.domain.enumeration.Skill;
import bham.team.domain.enumeration.Society;
import bham.team.domain.enumeration.Sports;
import bham.team.domain.enumeration.University;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
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
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "login", nullable = false, unique = true)
    private String login;

    @NotNull
    @Column(name = "first_name", nullable = false)
    private String firstName;

    @NotNull
    @Column(name = "last_name", nullable = false)
    private String lastName;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "university")
    private University university;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_society")
    private Society preferredSociety;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_events")
    private PreferredEvents preferredEvents;

    @Enumerated(EnumType.STRING)
    @Column(name = "events_time")
    private PreferredTime eventsTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_activities")
    private ActivityType preferredActivities;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(unique = true)
    private User user;

    @JsonIgnoreProperties(value = { "rankGiven", "activityMatch" }, allowSetters = true)
    @OneToOne(fetch = FetchType.LAZY, mappedBy = "rankGiven")
    private Ranking ranking;

    @ManyToMany(fetch = FetchType.LAZY, mappedBy = "participants")
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonIgnoreProperties(value = { "friendChat", "matchChat", "messages", "participants" }, allowSetters = true)
    private Set<MessageThread> messageThreads = new HashSet<>();

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

    public String getLogin() {
        return this.login;
    }

    public Profile login(String login) {
        this.setLogin(login);
        return this;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public String getFirstName() {
        return this.firstName;
    }

    public Profile firstName(String firstName) {
        this.setFirstName(firstName);
        return this;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return this.lastName;
    }

    public Profile lastName(String lastName) {
        this.setLastName(lastName);
        return this;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
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

    public University getUniversity() {
        return this.university;
    }

    public Profile university(University university) {
        this.setUniversity(university);
        return this;
    }

    public void setUniversity(University university) {
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

    public Society getPreferredSociety() {
        return this.preferredSociety;
    }

    public Profile preferredSociety(Society preferredSociety) {
        this.setPreferredSociety(preferredSociety);
        return this;
    }

    public void setPreferredSociety(Society preferredSociety) {
        this.preferredSociety = preferredSociety;
    }

    public PreferredEvents getPreferredEvents() {
        return this.preferredEvents;
    }

    public Profile preferredEvents(PreferredEvents preferredEvents) {
        this.setPreferredEvents(preferredEvents);
        return this;
    }

    public void setPreferredEvents(PreferredEvents preferredEvents) {
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

    public Set<MessageThread> getMessageThreads() {
        return this.messageThreads;
    }

    public void setMessageThreads(Set<MessageThread> messageThreads) {
        if (this.messageThreads != null) {
            this.messageThreads.forEach(i -> i.removeParticipants(this));
        }
        if (messageThreads != null) {
            messageThreads.forEach(i -> i.addParticipants(this));
        }
        this.messageThreads = messageThreads;
    }

    public Profile messageThreads(Set<MessageThread> messageThreads) {
        this.setMessageThreads(messageThreads);
        return this;
    }

    public Profile addMessageThread(MessageThread messageThread) {
        this.messageThreads.add(messageThread);
        messageThread.getParticipants().add(this);
        return this;
    }

    public Profile removeMessageThread(MessageThread messageThread) {
        this.messageThreads.remove(messageThread);
        messageThread.getParticipants().remove(this);
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
            ", login='" + getLogin() + "'" +
            ", firstName='" + getFirstName() + "'" +
            ", lastName='" + getLastName() + "'" +
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
