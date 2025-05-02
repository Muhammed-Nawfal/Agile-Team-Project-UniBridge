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
    @Column(name = "request_time", nullable = false)
    private Instant requestTime;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "request_status", nullable = false)
    private Decision requestStatus;

    @NotNull
    @Column(name = "friend_since", nullable = false)
    private Instant friendSince;

    @Column(name = "nickname")
    private String nickname;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "user", "ranking", "messageThreads" }, allowSetters = true)
    private Profile requestedByProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "user", "ranking", "messageThreads" }, allowSetters = true)
    private Profile requestedToProfile;

    @JsonIgnoreProperties(value = { "friendChat", "matchChat", "messages", "participants" }, allowSetters = true)
    @OneToOne(fetch = FetchType.LAZY, mappedBy = "friendChat")
    private MessageThread messageThread;

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

    public Instant getRequestTime() {
        return this.requestTime;
    }

    public FriendsList requestTime(Instant requestTime) {
        this.setRequestTime(requestTime);
        return this;
    }

    public void setRequestTime(Instant requestTime) {
        this.requestTime = requestTime;
    }

    public Decision getRequestStatus() {
        return this.requestStatus;
    }

    public FriendsList requestStatus(Decision requestStatus) {
        this.setRequestStatus(requestStatus);
        return this;
    }

    public void setRequestStatus(Decision requestStatus) {
        this.requestStatus = requestStatus;
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

    public String getNickname() {
        return this.nickname;
    }

    public FriendsList nickname(String nickname) {
        this.setNickname(nickname);
        return this;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public Profile getRequestedByProfile() {
        return this.requestedByProfile;
    }

    public void setRequestedByProfile(Profile profile) {
        this.requestedByProfile = profile;
    }

    public FriendsList requestedByProfile(Profile profile) {
        this.setRequestedByProfile(profile);
        return this;
    }

    public Profile getRequestedToProfile() {
        return this.requestedToProfile;
    }

    public void setRequestedToProfile(Profile profile) {
        this.requestedToProfile = profile;
    }

    public FriendsList requestedToProfile(Profile profile) {
        this.setRequestedToProfile(profile);
        return this;
    }

    public MessageThread getMessageThread() {
        return this.messageThread;
    }

    public void setMessageThread(MessageThread messageThread) {
        if (this.messageThread != null) {
            this.messageThread.setFriendChat(null);
        }
        if (messageThread != null) {
            messageThread.setFriendChat(this);
        }
        this.messageThread = messageThread;
    }

    public FriendsList messageThread(MessageThread messageThread) {
        this.setMessageThread(messageThread);
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
            ", requestTime='" + getRequestTime() + "'" +
            ", requestStatus='" + getRequestStatus() + "'" +
            ", friendSince='" + getFriendSince() + "'" +
            ", nickname='" + getNickname() + "'" +
            "}";
    }
}
