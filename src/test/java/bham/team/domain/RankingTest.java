package bham.team.domain;

import static bham.team.domain.ProfileTestSamples.*;
import static bham.team.domain.RankingTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import bham.team.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class RankingTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Ranking.class);
        Ranking ranking1 = getRankingSample1();
        Ranking ranking2 = new Ranking();
        assertThat(ranking1).isNotEqualTo(ranking2);

        ranking2.setId(ranking1.getId());
        assertThat(ranking1).isEqualTo(ranking2);

        ranking2 = getRankingSample2();
        assertThat(ranking1).isNotEqualTo(ranking2);
    }

    @Test
    void rankGivenTest() {
        Ranking ranking = getRankingRandomSampleGenerator();
        Profile profileBack = getProfileRandomSampleGenerator();

        ranking.setRankGiven(profileBack);
        assertThat(ranking.getRankGiven()).isEqualTo(profileBack);

        ranking.rankGiven(null);
        assertThat(ranking.getRankGiven()).isNull();
    }
}
