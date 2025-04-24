package bham.team.domain;

import static bham.team.domain.ChatTestSamples.*;
import static bham.team.domain.MessageThreadTestSamples.*;
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
    void threadTest() {
        Chat chat = getChatRandomSampleGenerator();
        MessageThread messageThreadBack = getMessageThreadRandomSampleGenerator();

        chat.setThread(messageThreadBack);
        assertThat(chat.getThread()).isEqualTo(messageThreadBack);

        chat.thread(null);
        assertThat(chat.getThread()).isNull();
    }

    @Test
    void senderTest() {
        Chat chat = getChatRandomSampleGenerator();
        Profile profileBack = getProfileRandomSampleGenerator();

        chat.setSender(profileBack);
        assertThat(chat.getSender()).isEqualTo(profileBack);

        chat.sender(null);
        assertThat(chat.getSender()).isNull();
    }

    @Test
    void receiverTest() {
        Chat chat = getChatRandomSampleGenerator();
        Profile profileBack = getProfileRandomSampleGenerator();

        chat.setReceiver(profileBack);
        assertThat(chat.getReceiver()).isEqualTo(profileBack);

        chat.receiver(null);
        assertThat(chat.getReceiver()).isNull();
    }

    @Test
    void messageThreadTest() {
        Chat chat = getChatRandomSampleGenerator();
        MessageThread messageThreadBack = getMessageThreadRandomSampleGenerator();

        chat.setMessageThread(messageThreadBack);
        assertThat(chat.getMessageThread()).isEqualTo(messageThreadBack);

        chat.messageThread(null);
        assertThat(chat.getMessageThread()).isNull();
    }
}
