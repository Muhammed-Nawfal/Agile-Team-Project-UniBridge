package bham.team.domain;

import static bham.team.domain.ActivityMatchTestSamples.*;
import static bham.team.domain.ActivityTestSamples.*;
import static bham.team.domain.ProfileTestSamples.*;
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
    void userNameTest() {
        ActivityMatch activityMatch = getActivityMatchRandomSampleGenerator();
        Profile profileBack = getProfileRandomSampleGenerator();

        activityMatch.setUserName(profileBack);
        assertThat(activityMatch.getUserName()).isEqualTo(profileBack);

        activityMatch.userName(null);
        assertThat(activityMatch.getUserName()).isNull();
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
}
