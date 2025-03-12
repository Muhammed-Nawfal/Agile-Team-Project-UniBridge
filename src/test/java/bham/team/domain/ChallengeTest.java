package bham.team.domain;

import static bham.team.domain.ActivityTestSamples.*;
import static bham.team.domain.ChallengeTestSamples.*;
import static bham.team.domain.FriendsListTestSamples.*;
import static bham.team.domain.ProfileTestSamples.*;
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

    @Test
    void challengesTest() {
        Challenge challenge = getChallengeRandomSampleGenerator();
        Profile profileBack = getProfileRandomSampleGenerator();

        challenge.setChallenges(profileBack);
        assertThat(challenge.getChallenges()).isEqualTo(profileBack);

        challenge.challenges(null);
        assertThat(challenge.getChallenges()).isNull();
    }

    @Test
    void challengedFriendTest() {
        Challenge challenge = getChallengeRandomSampleGenerator();
        FriendsList friendsListBack = getFriendsListRandomSampleGenerator();

        challenge.setChallengedFriend(friendsListBack);
        assertThat(challenge.getChallengedFriend()).isEqualTo(friendsListBack);

        challenge.challengedFriend(null);
        assertThat(challenge.getChallengedFriend()).isNull();
    }

    @Test
    void challengedActivityTest() {
        Challenge challenge = getChallengeRandomSampleGenerator();
        Activity activityBack = getActivityRandomSampleGenerator();

        challenge.setChallengedActivity(activityBack);
        assertThat(challenge.getChallengedActivity()).isEqualTo(activityBack);

        challenge.challengedActivity(null);
        assertThat(challenge.getChallengedActivity()).isNull();
    }
}
