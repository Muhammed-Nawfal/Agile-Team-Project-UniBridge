package bham.team.web.rest;

import bham.team.domain.Review;
import bham.team.repository.ReviewRepository;
import bham.team.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link bham.team.domain.Review}.
 */
@RestController
@RequestMapping("/api/reviews")
@Transactional
public class ReviewResource {

    private static final Logger LOG = LoggerFactory.getLogger(ReviewResource.class);

    private static final String ENTITY_NAME = "review";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ReviewRepository reviewRepository;

    public ReviewResource(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    /**
     * {@code POST  /reviews} : Create a new review.
     *
     * @param review the review to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new review, or with status {@code 400 (Bad Request)} if the review has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<Review> createReview(@Valid @RequestBody Review review) throws URISyntaxException {
        LOG.debug("REST request to save Review : {}", review);
        if (review.getId() != null) {
            throw new BadRequestAlertException("A new review cannot already have an ID", ENTITY_NAME, "idexists");
        }
        review = reviewRepository.save(review);
        return ResponseEntity.created(new URI("/api/reviews/" + review.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, review.getId().toString()))
            .body(review);
    }

    /**
     * {@code PUT  /reviews/:id} : Updates an existing review.
     *
     * @param id the id of the review to save.
     * @param review the review to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated review,
     * or with status {@code 400 (Bad Request)} if the review is not valid,
     * or with status {@code 500 (Internal Server Error)} if the review couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Review> updateReview(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody Review review
    ) throws URISyntaxException {
        LOG.debug("REST request to update Review : {}, {}", id, review);
        if (review.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, review.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!reviewRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        review = reviewRepository.save(review);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, review.getId().toString()))
            .body(review);
    }

    /**
     * {@code PATCH  /reviews/:id} : Partial updates given fields of an existing review, field will ignore if it is null
     *
     * @param id the id of the review to save.
     * @param review the review to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated review,
     * or with status {@code 400 (Bad Request)} if the review is not valid,
     * or with status {@code 404 (Not Found)} if the review is not found,
     * or with status {@code 500 (Internal Server Error)} if the review couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Review> partialUpdateReview(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Review review
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Review partially : {}, {}", id, review);
        if (review.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, review.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!reviewRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Review> result = reviewRepository
            .findById(review.getId())
            .map(existingReview -> {
                if (review.getDatePublished() != null) {
                    existingReview.setDatePublished(review.getDatePublished());
                }
                if (review.getStar() != null) {
                    existingReview.setStar(review.getStar());
                }
                if (review.getText() != null) {
                    existingReview.setText(review.getText());
                }

                return existingReview;
            })
            .map(reviewRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, review.getId().toString())
        );
    }

    /**
     * {@code GET  /reviews} : get all the reviews.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of reviews in body.
     */
    @GetMapping("")
    public List<Review> getAllReviews() {
        LOG.debug("REST request to get all Reviews");
        return reviewRepository.findAll();
    }

    /**
     * {@code GET  /reviews/:id} : get the "id" review.
     *
     * @param id the id of the review to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the review, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Review> getReview(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Review : {}", id);
        Optional<Review> review = reviewRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(review);
    }

    /**
     * {@code DELETE  /reviews/:id} : delete the "id" review.
     *
     * @param id the id of the review to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Review : {}", id);
        reviewRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
