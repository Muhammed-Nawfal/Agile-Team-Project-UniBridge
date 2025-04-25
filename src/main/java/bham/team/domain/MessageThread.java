package bham.team.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A MessageThread.
 */
@Entity
@Table(name = "message_thread")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class MessageThread implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "is_group", nullable = false)
    private Boolean isGroup;

    @Size(max = 100)
    @Column(name = "name", length = 100)
    private String name;

    @NotNull
    @Column(name = "created_on", nullable = false)
    private Instant createdOn;

    @Column(name = "updated_on")
    private Instant updatedOn;

    @JsonIgnoreProperties(value = { "requestedByProfile", "requestedToProfile", "messageThread" }, allowSetters = true)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(unique = true)
    private FriendsList friendChat;

    @JsonIgnoreProperties(value = { "ratings", "matchRequestor", "userDetails", "matchedActivity", "messageThread" }, allowSetters = true)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(unique = true)
    private ActivityMatch matchChat;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "messageThread")
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonIgnoreProperties(value = { "thread", "sender", "receiver", "messageThread" }, allowSetters = true)
    private Set<Chat> messages = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "rel_message_thread__participants",
        joinColumns = @JoinColumn(name = "message_thread_id"),
        inverseJoinColumns = @JoinColumn(name = "participants_id")
    )
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonIgnoreProperties(value = { "user", "ranking", "messageThreads" }, allowSetters = true)
    private Set<Profile> participants = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public MessageThread id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Boolean getIsGroup() {
        return this.isGroup;
    }

    public MessageThread isGroup(Boolean isGroup) {
        this.setIsGroup(isGroup);
        return this;
    }

    public void setIsGroup(Boolean isGroup) {
        this.isGroup = isGroup;
    }

    public String getName() {
        return this.name;
    }

    public MessageThread name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Instant getCreatedOn() {
        return this.createdOn;
    }

    public MessageThread createdOn(Instant createdOn) {
        this.setCreatedOn(createdOn);
        return this;
    }

    public void setCreatedOn(Instant createdOn) {
        this.createdOn = createdOn;
    }

    public Instant getUpdatedOn() {
        return this.updatedOn;
    }

    public MessageThread updatedOn(Instant updatedOn) {
        this.setUpdatedOn(updatedOn);
        return this;
    }

    public void setUpdatedOn(Instant updatedOn) {
        this.updatedOn = updatedOn;
    }

    public FriendsList getFriendChat() {
        return this.friendChat;
    }

    public void setFriendChat(FriendsList friendsList) {
        this.friendChat = friendsList;
    }

    public MessageThread friendChat(FriendsList friendsList) {
        this.setFriendChat(friendsList);
        return this;
    }

    public ActivityMatch getMatchChat() {
        return this.matchChat;
    }

    public void setMatchChat(ActivityMatch activityMatch) {
        this.matchChat = activityMatch;
    }

    public MessageThread matchChat(ActivityMatch activityMatch) {
        this.setMatchChat(activityMatch);
        return this;
    }

    public Set<Chat> getMessages() {
        return this.messages;
    }

    public void setMessages(Set<Chat> chats) {
        if (this.messages != null) {
            this.messages.forEach(i -> i.setMessageThread(null));
        }
        if (chats != null) {
            chats.forEach(i -> i.setMessageThread(this));
        }
        this.messages = chats;
    }

    public MessageThread messages(Set<Chat> chats) {
        this.setMessages(chats);
        return this;
    }

    public MessageThread addMessages(Chat chat) {
        this.messages.add(chat);
        chat.setMessageThread(this);
        return this;
    }

    public MessageThread removeMessages(Chat chat) {
        this.messages.remove(chat);
        chat.setMessageThread(null);
        return this;
    }

    public Set<Profile> getParticipants() {
        return this.participants;
    }

    public void setParticipants(Set<Profile> profiles) {
        this.participants = profiles;
    }

    public MessageThread participants(Set<Profile> profiles) {
        this.setParticipants(profiles);
        return this;
    }

    public MessageThread addParticipants(Profile profile) {
        this.participants.add(profile);
        return this;
    }

    public MessageThread removeParticipants(Profile profile) {
        this.participants.remove(profile);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof MessageThread)) {
            return false;
        }
        return getId() != null && getId().equals(((MessageThread) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "MessageThread{" +
            "id=" + getId() +
            ", isGroup='" + getIsGroup() + "'" +
            ", name='" + getName() + "'" +
            ", createdOn='" + getCreatedOn() + "'" +
            ", updatedOn='" + getUpdatedOn() + "'" +
            "}";
    }
}
