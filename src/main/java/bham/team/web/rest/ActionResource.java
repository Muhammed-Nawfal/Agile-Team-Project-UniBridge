package bham.team.web.rest;

import bham.team.domain.Action;
import bham.team.repository.ActionRepository;
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
 * REST controller for managing {@link bham.team.domain.Action}.
 */
@RestController
@RequestMapping("/api/actions")
@Transactional
public class ActionResource {

    private static final Logger LOG = LoggerFactory.getLogger(ActionResource.class);

    private static final String ENTITY_NAME = "action";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ActionRepository actionRepository;

    public ActionResource(ActionRepository actionRepository) {
        this.actionRepository = actionRepository;
    }

    /**
     * {@code POST  /actions} : Create a new action.
     *
     * @param action the action to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new action, or with status {@code 400 (Bad Request)} if the action has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<Action> createAction(@Valid @RequestBody Action action) throws URISyntaxException {
        LOG.debug("REST request to save Action : {}", action);
        if (action.getId() != null) {
            throw new BadRequestAlertException("A new action cannot already have an ID", ENTITY_NAME, "idexists");
        }
        action = actionRepository.save(action);
        return ResponseEntity.created(new URI("/api/actions/" + action.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, action.getId().toString()))
            .body(action);
    }

    /**
     * {@code PUT  /actions/:id} : Updates an existing action.
     *
     * @param id the id of the action to save.
     * @param action the action to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated action,
     * or with status {@code 400 (Bad Request)} if the action is not valid,
     * or with status {@code 500 (Internal Server Error)} if the action couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Action> updateAction(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody Action action
    ) throws URISyntaxException {
        LOG.debug("REST request to update Action : {}, {}", id, action);
        if (action.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, action.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!actionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        action = actionRepository.save(action);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, action.getId().toString()))
            .body(action);
    }

    /**
     * {@code PATCH  /actions/:id} : Partial updates given fields of an existing action, field will ignore if it is null
     *
     * @param id the id of the action to save.
     * @param action the action to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated action,
     * or with status {@code 400 (Bad Request)} if the action is not valid,
     * or with status {@code 404 (Not Found)} if the action is not found,
     * or with status {@code 500 (Internal Server Error)} if the action couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Action> partialUpdateAction(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Action action
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Action partially : {}, {}", id, action);
        if (action.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, action.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!actionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Action> result = actionRepository
            .findById(action.getId())
            .map(existingAction -> {
                if (action.getType() != null) {
                    existingAction.setType(action.getType());
                }
                if (action.getTimestamp() != null) {
                    existingAction.setTimestamp(action.getTimestamp());
                }

                return existingAction;
            })
            .map(actionRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, action.getId().toString())
        );
    }

    /**
     * {@code GET  /actions} : get all the actions.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of actions in body.
     */
    @GetMapping("")
    public List<Action> getAllActions() {
        LOG.debug("REST request to get all Actions");
        return actionRepository.findAll();
    }

    /**
     * {@code GET  /actions/:id} : get the "id" action.
     *
     * @param id the id of the action to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the action, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Action> getAction(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Action : {}", id);
        Optional<Action> action = actionRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(action);
    }

    /**
     * {@code DELETE  /actions/:id} : delete the "id" action.
     *
     * @param id the id of the action to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAction(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Action : {}", id);
        actionRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
