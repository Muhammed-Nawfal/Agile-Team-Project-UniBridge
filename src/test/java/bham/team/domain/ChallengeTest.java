package bham.team.domain;

import static bham.team.domain.ChallengeTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import bham.team.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ChallengeTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Challenge.class);
        Challenge challenge1 = getChallengeSample1();
        Challenge challenge2 = new Challenge();
        assertThat(challenge1).isNotEqualTo(challenge2);

        challenge2.setId(challenge1.getId());
        assertThat(challenge1).isEqualTo(challenge2);

        challenge2 = getChallengeSample2();
        assertThat(challenge1).isNotEqualTo(challenge2);
    }
}
