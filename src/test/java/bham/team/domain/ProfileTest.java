package bham.team.domain;

import static bham.team.domain.MessageThreadTestSamples.*;
import static bham.team.domain.ProfileTestSamples.*;
import static bham.team.domain.RankingTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import bham.team.web.rest.TestUtil;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class ProfileTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Profile.class);
        Profile profile1 = getProfileSample1();
        Profile profile2 = new Profile();
        assertThat(profile1).isNotEqualTo(profile2);

        profile2.setId(profile1.getId());
        assertThat(profile1).isEqualTo(profile2);

        profile2 = getProfileSample2();
        assertThat(profile1).isNotEqualTo(profile2);
    }

    @Test
    void rankingTest() {
        Profile profile = getProfileRandomSampleGenerator();
        Ranking rankingBack = getRankingRandomSampleGenerator();

        profile.setRanking(rankingBack);
        assertThat(profile.getRanking()).isEqualTo(rankingBack);
        assertThat(rankingBack.getRankGiven()).isEqualTo(profile);

        profile.ranking(null);
        assertThat(profile.getRanking()).isNull();
        assertThat(rankingBack.getRankGiven()).isNull();
    }

    @Test
    void messageThreadTest() {
        Profile profile = getProfileRandomSampleGenerator();
        MessageThread messageThreadBack = getMessageThreadRandomSampleGenerator();

        profile.addMessageThread(messageThreadBack);
        assertThat(profile.getMessageThreads()).containsOnly(messageThreadBack);
        assertThat(messageThreadBack.getParticipants()).containsOnly(profile);

        profile.removeMessageThread(messageThreadBack);
        assertThat(profile.getMessageThreads()).doesNotContain(messageThreadBack);
        assertThat(messageThreadBack.getParticipants()).doesNotContain(profile);

        profile.messageThreads(new HashSet<>(Set.of(messageThreadBack)));
        assertThat(profile.getMessageThreads()).containsOnly(messageThreadBack);
        assertThat(messageThreadBack.getParticipants()).containsOnly(profile);

        profile.setMessageThreads(new HashSet<>());
        assertThat(profile.getMessageThreads()).doesNotContain(messageThreadBack);
        assertThat(messageThreadBack.getParticipants()).doesNotContain(profile);
    }
}
