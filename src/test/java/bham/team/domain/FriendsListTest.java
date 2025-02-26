package bham.team.domain;

import static bham.team.domain.FriendsListTestSamples.*;
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
}
