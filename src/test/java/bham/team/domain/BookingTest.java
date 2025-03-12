package bham.team.domain;

import static bham.team.domain.ActivityTestSamples.*;
import static bham.team.domain.BookingTestSamples.*;
import static bham.team.domain.ProfileTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import bham.team.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class BookingTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Booking.class);
        Booking booking1 = getBookingSample1();
        Booking booking2 = new Booking();
        assertThat(booking1).isNotEqualTo(booking2);

        booking2.setId(booking1.getId());
        assertThat(booking1).isEqualTo(booking2);

        booking2 = getBookingSample2();
        assertThat(booking1).isNotEqualTo(booking2);
    }

    @Test
    void bookingDoneByTest() {
        Booking booking = getBookingRandomSampleGenerator();
        Profile profileBack = getProfileRandomSampleGenerator();

        booking.setBookingDoneBy(profileBack);
        assertThat(booking.getBookingDoneBy()).isEqualTo(profileBack);

        booking.bookingDoneBy(null);
        assertThat(booking.getBookingDoneBy()).isNull();
    }

    @Test
    void bookedActivityTest() {
        Booking booking = getBookingRandomSampleGenerator();
        Activity activityBack = getActivityRandomSampleGenerator();

        booking.setBookedActivity(activityBack);
        assertThat(booking.getBookedActivity()).isEqualTo(activityBack);

        booking.bookedActivity(null);
        assertThat(booking.getBookedActivity()).isNull();
    }

    @Test
    void activityTest() {
        Booking booking = getBookingRandomSampleGenerator();
        Activity activityBack = getActivityRandomSampleGenerator();

        booking.setActivity(activityBack);
        assertThat(booking.getActivity()).isEqualTo(activityBack);

        booking.activity(null);
        assertThat(booking.getActivity()).isNull();
    }
}
