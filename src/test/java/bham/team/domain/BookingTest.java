package bham.team.domain;

import static bham.team.domain.ActivityTestSamples.*;
import static bham.team.domain.BookingTestSamples.*;
import static bham.team.domain.LocationTestSamples.*;
import static bham.team.domain.ProfileTestSamples.*;
import static bham.team.domain.TimeSlotTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import bham.team.web.rest.TestUtil;
import java.util.HashSet;
import java.util.Set;
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
    void timeSlotsTest() {
        Booking booking = getBookingRandomSampleGenerator();
        TimeSlot timeSlotBack = getTimeSlotRandomSampleGenerator();

        Set<TimeSlot> timeSlotSet = new HashSet<>();
        timeSlotSet.add(timeSlotBack);

        booking.setTimeSlots(timeSlotSet);
        assertThat(booking.getTimeSlots()).isEqualTo(timeSlotSet);

        booking.timeSlots(null);
        assertThat(booking.getTimeSlots()).isNull();
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
    void bookingLocationTest() {
        Booking booking = getBookingRandomSampleGenerator();
        Location locationBack = getLocationRandomSampleGenerator();

        booking.setBookingLocation(locationBack);
        assertThat(booking.getBookingLocation()).isEqualTo(locationBack);

        booking.bookingLocation(null);
        assertThat(booking.getBookingLocation()).isNull();
    }

    @Test
    void creatorTest() {
        Booking booking = getBookingRandomSampleGenerator();
        Profile profileBack = getProfileRandomSampleGenerator();

        booking.setCreator(profileBack);
        assertThat(booking.getCreator()).isEqualTo(profileBack);

        booking.creator(null);
        assertThat(booking.getCreator()).isNull();
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

    @Test
    void timeSlotTest() {
        Booking booking = getBookingRandomSampleGenerator();
        TimeSlot timeSlotBack = getTimeSlotRandomSampleGenerator();

        booking.setTimeSlot(timeSlotBack);
        assertThat(booking.getTimeSlot()).isEqualTo(timeSlotBack);

        booking.timeSlot(null);
        assertThat(booking.getTimeSlot()).isNull();
    }
}
