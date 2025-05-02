package bham.team.domain;

import static bham.team.domain.ActivityMatchTestSamples.*;
import static bham.team.domain.ActivityTestSamples.*;
import static bham.team.domain.MessageThreadTestSamples.*;
import static bham.team.domain.ProfileTestSamples.*;
import static bham.team.domain.RankingTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import bham.team.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ActivityMatchTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ActivityMatch.class);
        ActivityMatch activityMatch1 = getActivityMatchSample1();
        ActivityMatch activityMatch2 = new ActivityMatch();
        assertThat(activityMatch1).isNotEqualTo(activityMatch2);

        activityMatch2.setId(activityMatch1.getId());
        assertThat(activityMatch1).isEqualTo(activityMatch2);

        activityMatch2 = getActivityMatchSample2();
        assertThat(activityMatch1).isNotEqualTo(activityMatch2);
    }

    @Test
    void ratingsTest() {
        ActivityMatch activityMatch = getActivityMatchRandomSampleGenerator();
        Ranking rankingBack = getRankingRandomSampleGenerator();

        activityMatch.setRatings(rankingBack);
        assertThat(activityMatch.getRatings()).isEqualTo(rankingBack);

        activityMatch.ratings(null);
        assertThat(activityMatch.getRatings()).isNull();
    }

    @Test
    void matchRequestorTest() {
        ActivityMatch activityMatch = getActivityMatchRandomSampleGenerator();
        Profile profileBack = getProfileRandomSampleGenerator();

        activityMatch.setMatchRequestor(profileBack);
        assertThat(activityMatch.getMatchRequestor()).isEqualTo(profileBack);

        activityMatch.matchRequestor(null);
        assertThat(activityMatch.getMatchRequestor()).isNull();
    }

    @Test
    void userDetailsTest() {
        ActivityMatch activityMatch = getActivityMatchRandomSampleGenerator();
        Profile profileBack = getProfileRandomSampleGenerator();

        activityMatch.setUserDetails(profileBack);
        assertThat(activityMatch.getUserDetails()).isEqualTo(profileBack);

        activityMatch.userDetails(null);
        assertThat(activityMatch.getUserDetails()).isNull();
    }

    @Test
    void matchedActivityTest() {
        ActivityMatch activityMatch = getActivityMatchRandomSampleGenerator();
        Activity activityBack = getActivityRandomSampleGenerator();

        activityMatch.setMatchedActivity(activityBack);
        assertThat(activityMatch.getMatchedActivity()).isEqualTo(activityBack);

        activityMatch.matchedActivity(null);
        assertThat(activityMatch.getMatchedActivity()).isNull();
    }

    @Test
    void messageThreadTest() {
        ActivityMatch activityMatch = getActivityMatchRandomSampleGenerator();
        MessageThread messageThreadBack = getMessageThreadRandomSampleGenerator();

        activityMatch.setMessageThread(messageThreadBack);
        assertThat(activityMatch.getMessageThread()).isEqualTo(messageThreadBack);
        assertThat(messageThreadBack.getMatchChat()).isEqualTo(activityMatch);

        activityMatch.messageThread(null);
        assertThat(activityMatch.getMessageThread()).isNull();
        assertThat(messageThreadBack.getMatchChat()).isNull();
    }
}
