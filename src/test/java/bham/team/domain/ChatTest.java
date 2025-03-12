package bham.team.domain;

import static bham.team.domain.ChatTestSamples.*;
import static bham.team.domain.FriendsListTestSamples.*;
import static bham.team.domain.ProfileTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import bham.team.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ChatTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Chat.class);
        Chat chat1 = getChatSample1();
        Chat chat2 = new Chat();
        assertThat(chat1).isNotEqualTo(chat2);

        chat2.setId(chat1.getId());
        assertThat(chat1).isEqualTo(chat2);

        chat2 = getChatSample2();
        assertThat(chat1).isNotEqualTo(chat2);
    }

    @Test
    void friendChatTest() {
        Chat chat = getChatRandomSampleGenerator();
        FriendsList friendsListBack = getFriendsListRandomSampleGenerator();

        chat.setFriendChat(friendsListBack);
        assertThat(chat.getFriendChat()).isEqualTo(friendsListBack);

        chat.friendChat(null);
        assertThat(chat.getFriendChat()).isNull();
    }

    @Test
    void chatsTest() {
        Chat chat = getChatRandomSampleGenerator();
        Profile profileBack = getProfileRandomSampleGenerator();

        chat.setChats(profileBack);
        assertThat(chat.getChats()).isEqualTo(profileBack);

        chat.chats(null);
        assertThat(chat.getChats()).isNull();
    }
}
