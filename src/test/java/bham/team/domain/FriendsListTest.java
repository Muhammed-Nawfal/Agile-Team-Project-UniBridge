package bham.team.domain;

import static bham.team.domain.ChatTestSamples.*;
import static bham.team.domain.FriendsListTestSamples.*;
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
    void friendsTest() {
        FriendsList friendsList = getFriendsListRandomSampleGenerator();
        Profile profileBack = getProfileRandomSampleGenerator();

        friendsList.setFriends(profileBack);
        assertThat(friendsList.getFriends()).isEqualTo(profileBack);

        friendsList.friends(null);
        assertThat(friendsList.getFriends()).isNull();
    }

    @Test
    void chatTest() {
        FriendsList friendsList = getFriendsListRandomSampleGenerator();
        Chat chatBack = getChatRandomSampleGenerator();

        friendsList.setChat(chatBack);
        assertThat(friendsList.getChat()).isEqualTo(chatBack);
        assertThat(chatBack.getFriendChat()).isEqualTo(friendsList);

        friendsList.chat(null);
        assertThat(friendsList.getChat()).isNull();
        assertThat(chatBack.getFriendChat()).isNull();
    }
}
