package bham.team.domain;

import static bham.team.domain.BookingTestSamples.*;
import static bham.team.domain.ProfileTestSamples.*;
import static bham.team.domain.RankingTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import bham.team.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ProfileTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Profile.class);
        Profile profile1 = getProfileSample1();
        Profile profile2 = new Profile();
        assertThat(profile1).isNotEqualTo(profile2);

        profile2.setId(profile1.getId());
        assertThat(profile1).isEqualTo(profile2);

        profile2 = getProfileSample2();
        assertThat(profile1).isNotEqualTo(profile2);
    }

    @Test
    void bookingTest() {
        Profile profile = getProfileRandomSampleGenerator();
        Booking bookingBack = getBookingRandomSampleGenerator();

        profile.setBooking(bookingBack);
        assertThat(profile.getBooking()).isEqualTo(bookingBack);
        assertThat(bookingBack.getBookingDoneBy()).isEqualTo(profile);

        profile.booking(null);
        assertThat(profile.getBooking()).isNull();
        assertThat(bookingBack.getBookingDoneBy()).isNull();
    }

    @Test
    void rankingTest() {
        Profile profile = getProfileRandomSampleGenerator();
        Ranking rankingBack = getRankingRandomSampleGenerator();

        profile.setRanking(rankingBack);
        assertThat(profile.getRanking()).isEqualTo(rankingBack);
        assertThat(rankingBack.getRankGiven()).isEqualTo(profile);

        profile.ranking(null);
        assertThat(profile.getRanking()).isNull();
        assertThat(rankingBack.getRankGiven()).isNull();
    }
}
