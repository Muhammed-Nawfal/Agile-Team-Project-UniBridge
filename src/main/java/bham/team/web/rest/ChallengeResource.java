package bham.team.web.rest;

import bham.team.domain.Challenge;
import bham.team.repository.ChallengeRepository;
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
 * REST controller for managing {@link bham.team.domain.Challenge}.
 */
@RestController
@RequestMapping("/api/challenges")
@Transactional
public class ChallengeResource {

    private static final Logger LOG = LoggerFactory.getLogger(ChallengeResource.class);

    private static final String ENTITY_NAME = "challenge";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ChallengeRepository challengeRepository;

    public ChallengeResource(ChallengeRepository challengeRepository) {
        this.challengeRepository = challengeRepository;
    }

    /**
     * {@code POST  /challenges} : Create a new challenge.
     *
     * @param challenge the challenge to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new challenge, or with status {@code 400 (Bad Request)} if the challenge has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<Challenge> createChallenge(@Valid @RequestBody Challenge challenge) throws URISyntaxException {
        LOG.debug("REST request to save Challenge : {}", challenge);
        if (challenge.getId() != null) {
            throw new BadRequestAlertException("A new challenge cannot already have an ID", ENTITY_NAME, "idexists");
        }
        challenge = challengeRepository.save(challenge);
        return ResponseEntity.created(new URI("/api/challenges/" + challenge.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, challenge.getId().toString()))
            .body(challenge);
    }

    /**
     * {@code PUT  /challenges/:id} : Updates an existing challenge.
     *
     * @param id the id of the challenge to save.
     * @param challenge the challenge to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated challenge,
     * or with status {@code 400 (Bad Request)} if the challenge is not valid,
     * or with status {@code 500 (Internal Server Error)} if the challenge couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Challenge> updateChallenge(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody Challenge challenge
    ) throws URISyntaxException {
        LOG.debug("REST request to update Challenge : {}, {}", id, challenge);
        if (challenge.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, challenge.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!challengeRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        challenge = challengeRepository.save(challenge);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, challenge.getId().toString()))
            .body(challenge);
    }

    /**
     * {@code PATCH  /challenges/:id} : Partial updates given fields of an existing challenge, field will ignore if it is null
     *
     * @param id the id of the challenge to save.
     * @param challenge the challenge to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated challenge,
     * or with status {@code 400 (Bad Request)} if the challenge is not valid,
     * or with status {@code 404 (Not Found)} if the challenge is not found,
     * or with status {@code 500 (Internal Server Error)} if the challenge couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Challenge> partialUpdateChallenge(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Challenge challenge
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Challenge partially : {}, {}", id, challenge);
        if (challenge.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, challenge.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!challengeRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Challenge> result = challengeRepository
            .findById(challenge.getId())
            .map(existingChallenge -> {
                if (challenge.getTitle() != null) {
                    existingChallenge.setTitle(challenge.getTitle());
                }
                if (challenge.getDescription() != null) {
                    existingChallenge.setDescription(challenge.getDescription());
                }
                if (challenge.getCategory() != null) {
                    existingChallenge.setCategory(challenge.getCategory());
                }
                if (challenge.getPoints() != null) {
                    existingChallenge.setPoints(challenge.getPoints());
                }
                if (challenge.getBadge() != null) {
                    existingChallenge.setBadge(challenge.getBadge());
                }
                if (challenge.getBadgeContentType() != null) {
                    existingChallenge.setBadgeContentType(challenge.getBadgeContentType());
                }
                if (challenge.getCreatedDate() != null) {
                    existingChallenge.setCreatedDate(challenge.getCreatedDate());
                }
                if (challenge.getExpiryDate() != null) {
                    existingChallenge.setExpiryDate(challenge.getExpiryDate());
                }
                if (challenge.getIsCompleted() != null) {
                    existingChallenge.setIsCompleted(challenge.getIsCompleted());
                }
                if (challenge.getCompletedDate() != null) {
                    existingChallenge.setCompletedDate(challenge.getCompletedDate());
                }
                if (challenge.getIsDisplayed() != null) {
                    existingChallenge.setIsDisplayed(challenge.getIsDisplayed());
                }

                return existingChallenge;
            })
            .map(challengeRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, challenge.getId().toString())
        );
    }

    /**
     * {@code GET  /challenges} : get all the challenges.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of challenges in body.
     */
    @GetMapping("")
    public List<Challenge> getAllChallenges() {
        LOG.debug("REST request to get all Challenges");
        return challengeRepository.findAll();
    }

    /**
     * {@code GET  /challenges/:id} : get the "id" challenge.
     *
     * @param id the id of the challenge to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the challenge, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Challenge> getChallenge(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Challenge : {}", id);
        Optional<Challenge> challenge = challengeRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(challenge);
    }

    /**
     * {@code DELETE  /challenges/:id} : delete the "id" challenge.
     *
     * @param id the id of the challenge to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChallenge(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Challenge : {}", id);
        challengeRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
