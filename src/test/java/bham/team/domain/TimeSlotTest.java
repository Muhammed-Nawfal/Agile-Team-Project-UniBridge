package bham.team.domain;

import static bham.team.domain.BookingTestSamples.*;
import static bham.team.domain.EventTestSamples.*;
import static bham.team.domain.TimeSlotTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import bham.team.web.rest.TestUtil;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class TimeSlotTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(TimeSlot.class);
        TimeSlot timeSlot1 = getTimeSlotSample1();
        TimeSlot timeSlot2 = new TimeSlot();
        assertThat(timeSlot1).isNotEqualTo(timeSlot2);

        timeSlot2.setId(timeSlot1.getId());
        assertThat(timeSlot1).isEqualTo(timeSlot2);

        timeSlot2 = getTimeSlotSample2();
        assertThat(timeSlot1).isNotEqualTo(timeSlot2);
    }

    @Test
    void bookingsListTest() {
        TimeSlot timeSlot = getTimeSlotRandomSampleGenerator();
        Booking bookingBack = getBookingRandomSampleGenerator();

        timeSlot.addBookingsList(bookingBack);
        assertThat(timeSlot.getBookingsLists()).containsOnly(bookingBack);
        assertThat(bookingBack.getTimeSlot()).isEqualTo(timeSlot);

        timeSlot.removeBookingsList(bookingBack);
        assertThat(timeSlot.getBookingsLists()).doesNotContain(bookingBack);
        assertThat(bookingBack.getTimeSlot()).isNull();

        timeSlot.bookingsLists(new HashSet<>(Set.of(bookingBack)));
        assertThat(timeSlot.getBookingsLists()).containsOnly(bookingBack);
        assertThat(bookingBack.getTimeSlot()).isEqualTo(timeSlot);

        timeSlot.setBookingsLists(new HashSet<>());
        assertThat(timeSlot.getBookingsLists()).doesNotContain(bookingBack);
        assertThat(bookingBack.getTimeSlot()).isNull();
    }

    @Test
    void eventTest() {
        TimeSlot timeSlot = getTimeSlotRandomSampleGenerator();
        Event eventBack = getEventRandomSampleGenerator();

        timeSlot.setEvent(eventBack);
        assertThat(timeSlot.getEvent()).isEqualTo(eventBack);

        timeSlot.event(null);
        assertThat(timeSlot.getEvent()).isNull();
    }
}
