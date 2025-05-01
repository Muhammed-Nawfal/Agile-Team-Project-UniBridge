package bham.team.domain;

import static bham.team.domain.ActivityTestSamples.*;
import static bham.team.domain.ChallengeTestSamples.*;
import static bham.team.domain.ProfileTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import bham.team.web.rest.TestUtil;
import java.util.HashSet;
import java.util.Set;
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

    @Test
    void activitiesTest() {
        Challenge challenge = getChallengeRandomSampleGenerator();
        Activity activityBack = getActivityRandomSampleGenerator();

        challenge.addActivities(activityBack);
        assertThat(challenge.getActivities()).containsOnly(activityBack);
        assertThat(activityBack.getChallenge()).isEqualTo(challenge);

        challenge.removeActivities(activityBack);
        assertThat(challenge.getActivities()).doesNotContain(activityBack);
        assertThat(activityBack.getChallenge()).isNull();

        challenge.activities(new HashSet<>(Set.of(activityBack)));
        assertThat(challenge.getActivities()).containsOnly(activityBack);
        assertThat(activityBack.getChallenge()).isEqualTo(challenge);

        challenge.setActivities(new HashSet<>());
        assertThat(challenge.getActivities()).doesNotContain(activityBack);
        assertThat(activityBack.getChallenge()).isNull();
    }

    @Test
    void assignedToTest() {
        Challenge challenge = getChallengeRandomSampleGenerator();
        Profile profileBack = getProfileRandomSampleGenerator();

        challenge.setAssignedTo(profileBack);
        assertThat(challenge.getAssignedTo()).isEqualTo(profileBack);

        challenge.assignedTo(null);
        assertThat(challenge.getAssignedTo()).isNull();
    }

    @Test
    void createdByTest() {
        Challenge challenge = getChallengeRandomSampleGenerator();
        Profile profileBack = getProfileRandomSampleGenerator();

        challenge.setCreatedBy(profileBack);
        assertThat(challenge.getCreatedBy()).isEqualTo(profileBack);

        challenge.createdBy(null);
        assertThat(challenge.getCreatedBy()).isNull();
    }
}
