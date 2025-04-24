package bham.team.domain;

import static bham.team.domain.ActivityMatchTestSamples.*;
import static bham.team.domain.ChatTestSamples.*;
import static bham.team.domain.FriendsListTestSamples.*;
import static bham.team.domain.MessageThreadTestSamples.*;
import static bham.team.domain.ProfileTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import bham.team.web.rest.TestUtil;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class MessageThreadTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(MessageThread.class);
        MessageThread messageThread1 = getMessageThreadSample1();
        MessageThread messageThread2 = new MessageThread();
        assertThat(messageThread1).isNotEqualTo(messageThread2);

        messageThread2.setId(messageThread1.getId());
        assertThat(messageThread1).isEqualTo(messageThread2);

        messageThread2 = getMessageThreadSample2();
        assertThat(messageThread1).isNotEqualTo(messageThread2);
    }

    @Test
    void friendChatTest() {
        MessageThread messageThread = getMessageThreadRandomSampleGenerator();
        FriendsList friendsListBack = getFriendsListRandomSampleGenerator();

        messageThread.setFriendChat(friendsListBack);
        assertThat(messageThread.getFriendChat()).isEqualTo(friendsListBack);

        messageThread.friendChat(null);
        assertThat(messageThread.getFriendChat()).isNull();
    }

    @Test
    void matchChatTest() {
        MessageThread messageThread = getMessageThreadRandomSampleGenerator();
        ActivityMatch activityMatchBack = getActivityMatchRandomSampleGenerator();

        messageThread.setMatchChat(activityMatchBack);
        assertThat(messageThread.getMatchChat()).isEqualTo(activityMatchBack);

        messageThread.matchChat(null);
        assertThat(messageThread.getMatchChat()).isNull();
    }

    @Test
    void messagesTest() {
        MessageThread messageThread = getMessageThreadRandomSampleGenerator();
        Chat chatBack = getChatRandomSampleGenerator();

        messageThread.addMessages(chatBack);
        assertThat(messageThread.getMessages()).containsOnly(chatBack);
        assertThat(chatBack.getMessageThread()).isEqualTo(messageThread);

        messageThread.removeMessages(chatBack);
        assertThat(messageThread.getMessages()).doesNotContain(chatBack);
        assertThat(chatBack.getMessageThread()).isNull();

        messageThread.messages(new HashSet<>(Set.of(chatBack)));
        assertThat(messageThread.getMessages()).containsOnly(chatBack);
        assertThat(chatBack.getMessageThread()).isEqualTo(messageThread);

        messageThread.setMessages(new HashSet<>());
        assertThat(messageThread.getMessages()).doesNotContain(chatBack);
        assertThat(chatBack.getMessageThread()).isNull();
    }

    @Test
    void participantsTest() {
        MessageThread messageThread = getMessageThreadRandomSampleGenerator();
        Profile profileBack = getProfileRandomSampleGenerator();

        messageThread.addParticipants(profileBack);
        assertThat(messageThread.getParticipants()).containsOnly(profileBack);

        messageThread.removeParticipants(profileBack);
        assertThat(messageThread.getParticipants()).doesNotContain(profileBack);

        messageThread.participants(new HashSet<>(Set.of(profileBack)));
        assertThat(messageThread.getParticipants()).containsOnly(profileBack);

        messageThread.setParticipants(new HashSet<>());
        assertThat(messageThread.getParticipants()).doesNotContain(profileBack);
    }
}
