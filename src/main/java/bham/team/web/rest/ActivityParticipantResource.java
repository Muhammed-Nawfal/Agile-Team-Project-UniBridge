package bham.team.web.rest;

import bham.team.domain.ActivityParticipant;
import bham.team.repository.ActivityParticipantRepository;
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
 * REST controller for managing {@link bham.team.domain.ActivityParticipant}.
 */
@RestController
@RequestMapping("/api/activity-participants")
@Transactional
public class ActivityParticipantResource {

    private static final Logger LOG = LoggerFactory.getLogger(ActivityParticipantResource.class);

    private static final String ENTITY_NAME = "activityParticipant";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ActivityParticipantRepository activityParticipantRepository;

    public ActivityParticipantResource(ActivityParticipantRepository activityParticipantRepository) {
        this.activityParticipantRepository = activityParticipantRepository;
    }

    /**
     * {@code POST  /activity-participants} : Create a new activityParticipant.
     *
     * @param activityParticipant the activityParticipant to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new activityParticipant, or with status {@code 400 (Bad Request)} if the activityParticipant has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<ActivityParticipant> createActivityParticipant(@Valid @RequestBody ActivityParticipant activityParticipant)
        throws URISyntaxException {
        LOG.debug("REST request to save ActivityParticipant : {}", activityParticipant);
        if (activityParticipant.getId() != null) {
            throw new BadRequestAlertException("A new activityParticipant cannot already have an ID", ENTITY_NAME, "idexists");
        }
        activityParticipant = activityParticipantRepository.save(activityParticipant);
        return ResponseEntity.created(new URI("/api/activity-participants/" + activityParticipant.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, activityParticipant.getId().toString()))
            .body(activityParticipant);
    }

    /**
     * {@code PUT  /activity-participants/:id} : Updates an existing activityParticipant.
     *
     * @param id the id of the activityParticipant to save.
     * @param activityParticipant the activityParticipant to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated activityParticipant,
     * or with status {@code 400 (Bad Request)} if the activityParticipant is not valid,
     * or with status {@code 500 (Internal Server Error)} if the activityParticipant couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ActivityParticipant> updateActivityParticipant(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody ActivityParticipant activityParticipant
    ) throws URISyntaxException {
        LOG.debug("REST request to update ActivityParticipant : {}, {}", id, activityParticipant);
        if (activityParticipant.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, activityParticipant.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!activityParticipantRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        activityParticipant = activityParticipantRepository.save(activityParticipant);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, activityParticipant.getId().toString()))
            .body(activityParticipant);
    }

    /**
     * {@code PATCH  /activity-participants/:id} : Partial updates given fields of an existing activityParticipant, field will ignore if it is null
     *
     * @param id the id of the activityParticipant to save.
     * @param activityParticipant the activityParticipant to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated activityParticipant,
     * or with status {@code 400 (Bad Request)} if the activityParticipant is not valid,
     * or with status {@code 404 (Not Found)} if the activityParticipant is not found,
     * or with status {@code 500 (Internal Server Error)} if the activityParticipant couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<ActivityParticipant> partialUpdateActivityParticipant(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody ActivityParticipant activityParticipant
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update ActivityParticipant partially : {}, {}", id, activityParticipant);
        if (activityParticipant.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, activityParticipant.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!activityParticipantRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<ActivityParticipant> result = activityParticipantRepository
            .findById(activityParticipant.getId())
            .map(existingActivityParticipant -> {
                if (activityParticipant.getJoinedDate() != null) {
                    existingActivityParticipant.setJoinedDate(activityParticipant.getJoinedDate());
                }
                if (activityParticipant.getStatus() != null) {
                    existingActivityParticipant.setStatus(activityParticipant.getStatus());
                }

                return existingActivityParticipant;
            })
            .map(activityParticipantRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, activityParticipant.getId().toString())
        );
    }

    /**
     * {@code GET  /activity-participants} : get all the activityParticipants.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of activityParticipants in body.
     */
    @GetMapping("")
    public List<ActivityParticipant> getAllActivityParticipants() {
        LOG.debug("REST request to get all ActivityParticipants");
        return activityParticipantRepository.findAll();
    }

    /**
     * {@code GET  /activity-participants/:id} : get the "id" activityParticipant.
     *
     * @param id the id of the activityParticipant to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the activityParticipant, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ActivityParticipant> getActivityParticipant(@PathVariable("id") Long id) {
        LOG.debug("REST request to get ActivityParticipant : {}", id);
        Optional<ActivityParticipant> activityParticipant = activityParticipantRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(activityParticipant);
    }

    /**
     * {@code DELETE  /activity-participants/:id} : delete the "id" activityParticipant.
     *
     * @param id the id of the activityParticipant to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivityParticipant(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete ActivityParticipant : {}", id);
        activityParticipantRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
