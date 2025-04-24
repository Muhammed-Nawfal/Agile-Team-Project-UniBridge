package bham.team.domain;

import static bham.team.domain.ProfileTestSamples.*;
import static bham.team.domain.ReviewTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import bham.team.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ReviewTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Review.class);
        Review review1 = getReviewSample1();
        Review review2 = new Review();
        assertThat(review1).isNotEqualTo(review2);

        review2.setId(review1.getId());
        assertThat(review1).isEqualTo(review2);

        review2 = getReviewSample2();
        assertThat(review1).isNotEqualTo(review2);
    }

    @Test
    void aboutUserTest() {
        Review review = getReviewRandomSampleGenerator();
        Profile profileBack = getProfileRandomSampleGenerator();

        review.setAboutUser(profileBack);
        assertThat(review.getAboutUser()).isEqualTo(profileBack);

        review.aboutUser(null);
        assertThat(review.getAboutUser()).isNull();
    }

    @Test
    void fromUserTest() {
        Review review = getReviewRandomSampleGenerator();
        Profile profileBack = getProfileRandomSampleGenerator();

        review.setFromUser(profileBack);
        assertThat(review.getFromUser()).isEqualTo(profileBack);

        review.fromUser(null);
        assertThat(review.getFromUser()).isNull();
    }
}
