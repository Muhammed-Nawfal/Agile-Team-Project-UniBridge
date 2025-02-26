package bham.team.domain;

import static bham.team.domain.ActivityMatchTestSamples.*;
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
}
