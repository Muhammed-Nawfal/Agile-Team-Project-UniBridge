package bham.team.domain;

import static bham.team.domain.FriendsListTestSamples.*;
import static bham.team.domain.MessageThreadTestSamples.*;
import static bham.team.domain.ProfileTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import bham.team.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class FriendsListTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(FriendsList.class);
        FriendsList friendsList1 = getFriendsListSample1();
        FriendsList friendsList2 = new FriendsList();
        assertThat(friendsList1).isNotEqualTo(friendsList2);

        friendsList2.setId(friendsList1.getId());
        assertThat(friendsList1).isEqualTo(friendsList2);

        friendsList2 = getFriendsListSample2();
        assertThat(friendsList1).isNotEqualTo(friendsList2);
    }

    @Test
    void requestedByProfileTest() {
        FriendsList friendsList = getFriendsListRandomSampleGenerator();
        Profile profileBack = getProfileRandomSampleGenerator();

        friendsList.setRequestedByProfile(profileBack);
        assertThat(friendsList.getRequestedByProfile()).isEqualTo(profileBack);

        friendsList.requestedByProfile(null);
        assertThat(friendsList.getRequestedByProfile()).isNull();
    }

    @Test
    void requestedToProfileTest() {
        FriendsList friendsList = getFriendsListRandomSampleGenerator();
        Profile profileBack = getProfileRandomSampleGenerator();

        friendsList.setRequestedToProfile(profileBack);
        assertThat(friendsList.getRequestedToProfile()).isEqualTo(profileBack);

        friendsList.requestedToProfile(null);
        assertThat(friendsList.getRequestedToProfile()).isNull();
    }

    @Test
    void messageThreadTest() {
        FriendsList friendsList = getFriendsListRandomSampleGenerator();
        MessageThread messageThreadBack = getMessageThreadRandomSampleGenerator();

        friendsList.setMessageThread(messageThreadBack);
        assertThat(friendsList.getMessageThread()).isEqualTo(messageThreadBack);
        assertThat(messageThreadBack.getFriendChat()).isEqualTo(friendsList);

        friendsList.messageThread(null);
        assertThat(friendsList.getMessageThread()).isNull();
        assertThat(messageThreadBack.getFriendChat()).isNull();
    }
}
