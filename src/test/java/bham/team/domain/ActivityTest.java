package bham.team.domain;

import static bham.team.domain.ActivityTestSamples.*;
import static bham.team.domain.BookingTestSamples.*;
import static bham.team.domain.ChallengeTestSamples.*;
import static bham.team.domain.ProfileTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import bham.team.web.rest.TestUtil;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class ActivityTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Activity.class);
        Activity activity1 = getActivitySample1();
        Activity activity2 = new Activity();
        assertThat(activity1).isNotEqualTo(activity2);

        activity2.setId(activity1.getId());
        assertThat(activity1).isEqualTo(activity2);

        activity2 = getActivitySample2();
        assertThat(activity1).isNotEqualTo(activity2);
    }

    @Test
    void bookingsTest() {
        Activity activity = getActivityRandomSampleGenerator();
        Booking bookingBack = getBookingRandomSampleGenerator();

        activity.addBookings(bookingBack);
        assertThat(activity.getBookings()).containsOnly(bookingBack);
        assertThat(bookingBack.getActivity()).isEqualTo(activity);

        activity.removeBookings(bookingBack);
        assertThat(activity.getBookings()).doesNotContain(bookingBack);
        assertThat(bookingBack.getActivity()).isNull();

        activity.bookings(new HashSet<>(Set.of(bookingBack)));
        assertThat(activity.getBookings()).containsOnly(bookingBack);
        assertThat(bookingBack.getActivity()).isEqualTo(activity);

        activity.setBookings(new HashSet<>());
        assertThat(activity.getBookings()).doesNotContain(bookingBack);
        assertThat(bookingBack.getActivity()).isNull();
    }

    @Test
    void creatorTest() {
        Activity activity = getActivityRandomSampleGenerator();
        Profile profileBack = getProfileRandomSampleGenerator();

        activity.setCreator(profileBack);
        assertThat(activity.getCreator()).isEqualTo(profileBack);

        activity.creator(null);
        assertThat(activity.getCreator()).isNull();
    }

    @Test
    void challengeTest() {
        Activity activity = getActivityRandomSampleGenerator();
        Challenge challengeBack = getChallengeRandomSampleGenerator();

        activity.setChallenge(challengeBack);
        assertThat(activity.getChallenge()).isEqualTo(challengeBack);

        activity.challenge(null);
        assertThat(activity.getChallenge()).isNull();
    }
}
