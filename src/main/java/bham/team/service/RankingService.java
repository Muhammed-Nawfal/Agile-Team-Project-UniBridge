package bham.team.service;

import bham.team.domain.Profile;
import bham.team.domain.Review;
import bham.team.repository.ProfileRepository;
import bham.team.repository.ReviewRepository;
import bham.team.service.mapper.ProfileMapper;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link Review}.
 */
@Service
@Transactional
public class RankingService {

    private final Logger log = LoggerFactory.getLogger(RankingService.class);

    private final ReviewRepository reviewRepository;
    private final ProfileRepository profileRepository;
    private final ProfileMapper profileMapper;

    public RankingService(ReviewRepository reviewRepository, ProfileRepository profileRepository, ProfileMapper profileMapper) {
        this.reviewRepository = reviewRepository;
        this.profileRepository = profileRepository;
        this.profileMapper = profileMapper;
    }

    /**
     * Save a review.
     *
     * @param review the entity to save.
     * @return the persisted entity.
     */
    public Review save(Review review) {
        log.debug("Request to save Review : {}", review);
        return reviewRepository.save(review);
    }

    /**
     * Get all reviews for a profile.
     *
     * @param profileId the ID of the profile
     * @return list of friends lists representing the profile's friends
     */
    @Transactional(readOnly = true)
    public List<Review> getReviewsForProfileId(Long profileId) {
        log.debug("Request to get reviews for profile ID {}", profileId);

        Profile profile = profileRepository
            .findById(profileId)
            .orElseThrow(() -> new IllegalArgumentException("Profile not found with ID: " + profileId));

        return reviewRepository.findReviewsForProfile(profile);
    }

    /**
     * Get all reviews sent by a profile.
     *
     * @param profileId the ID of the profile
     * @return list of reviews sent by the profile
     */
    @Transactional(readOnly = true)
    public List<Review> getReviewsByProfileId(Long profileId) {
        log.debug("Request to get reviews by profile ID {}", profileId);

        Profile profile = profileRepository
            .findById(profileId)
            .orElseThrow(() -> new IllegalArgumentException("Profile not found with ID: " + profileId));

        return reviewRepository.findReviewsByProfile(profile);
    }

    /**
     * Get the login of the fromUser from a Review entity
     *
     * @param reviewId the ID of the Review entity
     * @return the login of the requested friend profile
     */
    @Transactional(readOnly = true)
    public String getFromUserLoginById(Long reviewId) {
        log.debug("Request to get fromLogin for Review ID: {}", reviewId);
        return reviewRepository.getFromUserLoginById(reviewId);
    }

    /**
     * Delete a review
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete Review : {}", id);
        reviewRepository.deleteById(id);
    }
}
