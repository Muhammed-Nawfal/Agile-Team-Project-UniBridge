package bham.team.domain;

import bham.team.domain.enumeration.ActionType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A Chat.
 */
@Entity
@Table(name = "chat")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Chat implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @Lob
    @Column(name = "message", nullable = false)
    private String message;

    @NotNull
    @Column(name = "timestamp", nullable = false)
    private Instant timestamp;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private ActionType type;

    @JsonIgnoreProperties(value = { "friends", "user", "friend", "chat" }, allowSetters = true)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(unique = true)
    private FriendsList friendChat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "user", "booking", "ranking" }, allowSetters = true)
    private Profile chats;

    @ManyToOne(fetch = FetchType.LAZY)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    private User receiver;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Chat id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMessage() {
        return this.message;
    }

    public Chat message(String message) {
        this.setMessage(message);
        return this;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Instant getTimestamp() {
        return this.timestamp;
    }

    public Chat timestamp(Instant timestamp) {
        this.setTimestamp(timestamp);
        return this;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public ActionType getType() {
        return this.type;
    }

    public Chat type(ActionType type) {
        this.setType(type);
        return this;
    }

    public void setType(ActionType type) {
        this.type = type;
    }

    public FriendsList getFriendChat() {
        return this.friendChat;
    }

    public void setFriendChat(FriendsList friendsList) {
        this.friendChat = friendsList;
    }

    public Chat friendChat(FriendsList friendsList) {
        this.setFriendChat(friendsList);
        return this;
    }

    public Profile getChats() {
        return this.chats;
    }

    public void setChats(Profile profile) {
        this.chats = profile;
    }

    public Chat chats(Profile profile) {
        this.setChats(profile);
        return this;
    }

    public User getSender() {
        return this.sender;
    }

    public void setSender(User user) {
        this.sender = user;
    }

    public Chat sender(User user) {
        this.setSender(user);
        return this;
    }

    public User getReceiver() {
        return this.receiver;
    }

    public void setReceiver(User user) {
        this.receiver = user;
    }

    public Chat receiver(User user) {
        this.setReceiver(user);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Chat)) {
            return false;
        }
        return getId() != null && getId().equals(((Chat) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Chat{" +
            "id=" + getId() +
            ", message='" + getMessage() + "'" +
            ", timestamp='" + getTimestamp() + "'" +
            ", type='" + getType() + "'" +
            "}";
    }
}
