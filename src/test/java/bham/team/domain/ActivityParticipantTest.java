package bham.team.domain;

import static bham.team.domain.ActivityParticipantTestSamples.*;
import static bham.team.domain.ActivityTestSamples.*;
import static bham.team.domain.ProfileTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import bham.team.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ActivityParticipantTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ActivityParticipant.class);
        ActivityParticipant activityParticipant1 = getActivityParticipantSample1();
        ActivityParticipant activityParticipant2 = new ActivityParticipant();
        assertThat(activityParticipant1).isNotEqualTo(activityParticipant2);

        activityParticipant2.setId(activityParticipant1.getId());
        assertThat(activityParticipant1).isEqualTo(activityParticipant2);

        activityParticipant2 = getActivityParticipantSample2();
        assertThat(activityParticipant1).isNotEqualTo(activityParticipant2);
    }

    @Test
    void participantTest() {
        ActivityParticipant activityParticipant = getActivityParticipantRandomSampleGenerator();
        Profile profileBack = getProfileRandomSampleGenerator();

        activityParticipant.setParticipant(profileBack);
        assertThat(activityParticipant.getParticipant()).isEqualTo(profileBack);

        activityParticipant.participant(null);
        assertThat(activityParticipant.getParticipant()).isNull();
    }

    @Test
    void activityTest() {
        ActivityParticipant activityParticipant = getActivityParticipantRandomSampleGenerator();
        Activity activityBack = getActivityRandomSampleGenerator();

        activityParticipant.setActivity(activityBack);
        assertThat(activityParticipant.getActivity()).isEqualTo(activityBack);

        activityParticipant.activity(null);
        assertThat(activityParticipant.getActivity()).isNull();
    }
}
