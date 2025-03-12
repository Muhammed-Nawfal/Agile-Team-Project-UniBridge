package bham.team.domain;

import bham.team.domain.enumeration.Decision;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A FriendsList.
 */
@Entity
@Table(name = "friends_list")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class FriendsList implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "friend_request", nullable = false)
    private Decision friendRequest;

    @NotNull
    @Column(name = "friend_since", nullable = false)
    private Instant friendSince;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "user", "booking", "ranking" }, allowSetters = true)
    private Profile friends;

    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    private User friend;

    @JsonIgnoreProperties(value = { "friendChat", "chats", "sender", "receiver" }, allowSetters = true)
    @OneToOne(fetch = FetchType.LAZY, mappedBy = "friendChat")
    private Chat chat;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public FriendsList id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Decision getFriendRequest() {
        return this.friendRequest;
    }

    public FriendsList friendRequest(Decision friendRequest) {
        this.setFriendRequest(friendRequest);
        return this;
    }

    public void setFriendRequest(Decision friendRequest) {
        this.friendRequest = friendRequest;
    }

    public Instant getFriendSince() {
        return this.friendSince;
    }

    public FriendsList friendSince(Instant friendSince) {
        this.setFriendSince(friendSince);
        return this;
    }

    public void setFriendSince(Instant friendSince) {
        this.friendSince = friendSince;
    }

    public Profile getFriends() {
        return this.friends;
    }

    public void setFriends(Profile profile) {
        this.friends = profile;
    }

    public FriendsList friends(Profile profile) {
        this.setFriends(profile);
        return this;
    }

    public User getUser() {
        return this.user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public FriendsList user(User user) {
        this.setUser(user);
        return this;
    }

    public User getFriend() {
        return this.friend;
    }

    public void setFriend(User user) {
        this.friend = user;
    }

    public FriendsList friend(User user) {
        this.setFriend(user);
        return this;
    }

    public Chat getChat() {
        return this.chat;
    }

    public void setChat(Chat chat) {
        if (this.chat != null) {
            this.chat.setFriendChat(null);
        }
        if (chat != null) {
            chat.setFriendChat(this);
        }
        this.chat = chat;
    }

    public FriendsList chat(Chat chat) {
        this.setChat(chat);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof FriendsList)) {
            return false;
        }
        return getId() != null && getId().equals(((FriendsList) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "FriendsList{" +
            "id=" + getId() +
            ", friendRequest='" + getFriendRequest() + "'" +
            ", friendSince='" + getFriendSince() + "'" +
            "}";
    }
}
