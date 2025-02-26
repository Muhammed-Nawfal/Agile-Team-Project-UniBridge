package bham.team.domain;

import bham.team.domain.enumeration.Decision;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
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

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "rel_friends_list__user_id",
        joinColumns = @JoinColumn(name = "friends_list_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id_id")
    )
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    private Set<User> userIds = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "rel_friends_list__friend_id",
        joinColumns = @JoinColumn(name = "friends_list_id"),
        inverseJoinColumns = @JoinColumn(name = "friend_id_id")
    )
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    private Set<User> friendIds = new HashSet<>();

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

    public Set<User> getUserIds() {
        return this.userIds;
    }

    public void setUserIds(Set<User> users) {
        this.userIds = users;
    }

    public FriendsList userIds(Set<User> users) {
        this.setUserIds(users);
        return this;
    }

    public FriendsList addUserId(User user) {
        this.userIds.add(user);
        return this;
    }

    public FriendsList removeUserId(User user) {
        this.userIds.remove(user);
        return this;
    }

    public Set<User> getFriendIds() {
        return this.friendIds;
    }

    public void setFriendIds(Set<User> users) {
        this.friendIds = users;
    }

    public FriendsList friendIds(Set<User> users) {
        this.setFriendIds(users);
        return this;
    }

    public FriendsList addFriendId(User user) {
        this.friendIds.add(user);
        return this;
    }

    public FriendsList removeFriendId(User user) {
        this.friendIds.remove(user);
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
