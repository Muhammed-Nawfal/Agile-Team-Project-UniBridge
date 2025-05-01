package bham.team.web.rest;

import bham.team.domain.TimeSlot;
import bham.team.repository.TimeSlotRepository;
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
 * REST controller for managing {@link bham.team.domain.TimeSlot}.
 */
@RestController
@RequestMapping("/api/time-slots")
@Transactional
public class TimeSlotResource {

    private static final Logger LOG = LoggerFactory.getLogger(TimeSlotResource.class);

    private static final String ENTITY_NAME = "timeSlot";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final TimeSlotRepository timeSlotRepository;

    public TimeSlotResource(TimeSlotRepository timeSlotRepository) {
        this.timeSlotRepository = timeSlotRepository;
    }

    /**
     * {@code POST  /time-slots} : Create a new timeSlot.
     *
     * @param timeSlot the timeSlot to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new timeSlot, or with status {@code 400 (Bad Request)} if the timeSlot has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<TimeSlot> createTimeSlot(@Valid @RequestBody TimeSlot timeSlot) throws URISyntaxException {
        LOG.debug("REST request to save TimeSlot : {}", timeSlot);
        if (timeSlot.getId() != null) {
            throw new BadRequestAlertException("A new timeSlot cannot already have an ID", ENTITY_NAME, "idexists");
        }
        timeSlot = timeSlotRepository.save(timeSlot);
        return ResponseEntity.created(new URI("/api/time-slots/" + timeSlot.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, timeSlot.getId().toString()))
            .body(timeSlot);
    }

    /**
     * {@code PUT  /time-slots/:id} : Updates an existing timeSlot.
     *
     * @param id the id of the timeSlot to save.
     * @param timeSlot the timeSlot to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated timeSlot,
     * or with status {@code 400 (Bad Request)} if the timeSlot is not valid,
     * or with status {@code 500 (Internal Server Error)} if the timeSlot couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<TimeSlot> updateTimeSlot(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody TimeSlot timeSlot
    ) throws URISyntaxException {
        LOG.debug("REST request to update TimeSlot : {}, {}", id, timeSlot);
        if (timeSlot.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, timeSlot.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!timeSlotRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        timeSlot = timeSlotRepository.save(timeSlot);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, timeSlot.getId().toString()))
            .body(timeSlot);
    }

    /**
     * {@code PATCH  /time-slots/:id} : Partial updates given fields of an existing timeSlot, field will ignore if it is null
     *
     * @param id the id of the timeSlot to save.
     * @param timeSlot the timeSlot to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated timeSlot,
     * or with status {@code 400 (Bad Request)} if the timeSlot is not valid,
     * or with status {@code 404 (Not Found)} if the timeSlot is not found,
     * or with status {@code 500 (Internal Server Error)} if the timeSlot couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<TimeSlot> partialUpdateTimeSlot(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody TimeSlot timeSlot
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update TimeSlot partially : {}, {}", id, timeSlot);
        if (timeSlot.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, timeSlot.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!timeSlotRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<TimeSlot> result = timeSlotRepository
            .findById(timeSlot.getId())
            .map(existingTimeSlot -> {
                if (timeSlot.getDate() != null) {
                    existingTimeSlot.setDate(timeSlot.getDate());
                }
                if (timeSlot.getStartHour() != null) {
                    existingTimeSlot.setStartHour(timeSlot.getStartHour());
                }
                if (timeSlot.getEndHour() != null) {
                    existingTimeSlot.setEndHour(timeSlot.getEndHour());
                }
                if (timeSlot.getCapacity() != null) {
                    existingTimeSlot.setCapacity(timeSlot.getCapacity());
                }
                if (timeSlot.getRemainingCapacity() != null) {
                    existingTimeSlot.setRemainingCapacity(timeSlot.getRemainingCapacity());
                }
                if (timeSlot.getStatus() != null) {
                    existingTimeSlot.setStatus(timeSlot.getStatus());
                }

                return existingTimeSlot;
            })
            .map(timeSlotRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, timeSlot.getId().toString())
        );
    }

    /**
     * {@code GET  /time-slots} : get all the timeSlots.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of timeSlots in body.
     */
    @GetMapping("")
    public List<TimeSlot> getAllTimeSlots() {
        LOG.debug("REST request to get all TimeSlots");
        return timeSlotRepository.findAll();
    }

    /**
     * {@code GET  /time-slots/:id} : get the "id" timeSlot.
     *
     * @param id the id of the timeSlot to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the timeSlot, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TimeSlot> getTimeSlot(@PathVariable("id") Long id) {
        LOG.debug("REST request to get TimeSlot : {}", id);
        Optional<TimeSlot> timeSlot = timeSlotRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(timeSlot);
    }

    /**
     * {@code DELETE  /time-slots/:id} : delete the "id" timeSlot.
     *
     * @param id the id of the timeSlot to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTimeSlot(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete TimeSlot : {}", id);
        timeSlotRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
