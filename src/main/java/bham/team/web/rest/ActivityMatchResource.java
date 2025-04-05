package bham.team.web.rest;

import bham.team.domain.ActivityMatch;
import bham.team.domain.Profile;
import bham.team.domain.User;
import bham.team.domain.enumeration.ActivityType;
import bham.team.repository.ActivityMatchRepository;
import bham.team.service.ActivityMatchService;
import bham.team.service.dto.ProfileDTO;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link bham.team.domain.ActivityMatch}.
 */
@RestController
@RequestMapping("/api/activity-matches")
@Transactional
public class ActivityMatchResource {

    private static final Logger LOG = LoggerFactory.getLogger(ActivityMatchResource.class);

    private final ActivityMatchService activityMatchService;

    private static final String ENTITY_NAME = "activityMatch";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ActivityMatchRepository activityMatchRepository;

    public ActivityMatchResource(ActivityMatchService activityMatchService, ActivityMatchRepository activityMatchRepository) {
        this.activityMatchService = activityMatchService;
        this.activityMatchRepository = activityMatchRepository;
    }

    /**
     * {@code POST  /activity-matches} : Create a new activityMatch.
     *
     * @param activityMatch the activityMatch to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new activityMatch, or with status {@code 400 (Bad Request)} if the activityMatch has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<ActivityMatch> createActivityMatch(@Valid @RequestBody ActivityMatch activityMatch) throws URISyntaxException {
        LOG.debug("REST request to save ActivityMatch : {}", activityMatch);
        if (activityMatch.getId() != null) {
            throw new BadRequestAlertException("A new activityMatch cannot already have an ID", ENTITY_NAME, "idexists");
        }
        activityMatch = activityMatchRepository.save(activityMatch);
        return ResponseEntity.created(new URI("/api/activity-matches/" + activityMatch.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, activityMatch.getId().toString()))
            .body(activityMatch);
    }

    /**
     * {@code PUT  /activity-matches/:id} : Updates an existing activityMatch.
     *
     * @param id the id of the activityMatch to save.
     * @param activityMatch the activityMatch to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated activityMatch,
     * or with status {@code 400 (Bad Request)} if the activityMatch is not valid,
     * or with status {@code 500 (Internal Server Error)} if the activityMatch couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ActivityMatch> updateActivityMatch(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody ActivityMatch activityMatch
    ) throws URISyntaxException {
        LOG.debug("REST request to update ActivityMatch : {}, {}", id, activityMatch);
        if (activityMatch.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, activityMatch.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!activityMatchRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        activityMatch = activityMatchRepository.save(activityMatch);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, activityMatch.getId().toString()))
            .body(activityMatch);
    }

    /**
     * {@code PATCH  /activity-matches/:id} : Partial updates given fields of an existing activityMatch, field will ignore if it is null
     *
     * @param id the id of the activityMatch to save.
     * @param activityMatch the activityMatch to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated activityMatch,
     * or with status {@code 400 (Bad Request)} if the activityMatch is not valid,
     * or with status {@code 404 (Not Found)} if the activityMatch is not found,
     * or with status {@code 500 (Internal Server Error)} if the activityMatch couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<ActivityMatch> partialUpdateActivityMatch(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody ActivityMatch activityMatch
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update ActivityMatch partially : {}, {}", id, activityMatch);
        if (activityMatch.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, activityMatch.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!activityMatchRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<ActivityMatch> result = activityMatchRepository
            .findById(activityMatch.getId())
            .map(existingActivityMatch -> {
                if (activityMatch.getActivityType() != null) {
                    existingActivityMatch.setActivityType(activityMatch.getActivityType());
                }
                if (activityMatch.getStatus() != null) {
                    existingActivityMatch.setStatus(activityMatch.getStatus());
                }

                return existingActivityMatch;
            })
            .map(activityMatchRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, activityMatch.getId().toString())
        );
    }

    /**
     * {@code GET  /activity-matches} : get all the activityMatches.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of activityMatches in body.
     */
    @GetMapping("")
    public List<ActivityMatch> getAllActivityMatches() {
        LOG.debug("REST request to get all ActivityMatches");
        return activityMatchRepository.findAll();
    }

    /**
     * {@code GET  /activity-matches/:id} : get the "id" activityMatch.
     *
     * @param id the id of the activityMatch to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the activityMatch, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ActivityMatch> getActivityMatch(@PathVariable("id") Long id) {
        LOG.debug("REST request to get ActivityMatch : {}", id);
        Optional<ActivityMatch> activityMatch = activityMatchRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(activityMatch);
    }

    /**
     * {@code DELETE  /activity-matches/:id} : delete the "id" activityMatch.
     *
     * @param id the id of the activityMatch to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivityMatch(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete ActivityMatch : {}", id);
        activityMatchRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * Get profiles by preferred activity.
     *
     * @param activityType the activity type to filter by.
     * @return the list of profiles matching the activity type.
     */
    @GetMapping("/profiles/preferred-activity")
    public ResponseEntity<List<Profile>> getProfilesByPreferredActivity(@RequestParam ActivityType activityType) {
        LOG.debug("REST request to get profiles by preferred activity: {}", activityType);
        List<Profile> profiles = activityMatchService.getProfilesByPreferredActivity(activityType);
        LOG.debug("Found {} profiles for activity type {}", profiles.size(), activityType);
        return ResponseEntity.ok(profiles);
    }
}
