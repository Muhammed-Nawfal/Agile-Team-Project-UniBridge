package bham.team.web.rest;

import bham.team.domain.Activity;
import bham.team.domain.Profile;
import bham.team.domain.enumeration.ActivityType;
import bham.team.domain.enumeration.Status;
import bham.team.repository.ActivityRepository;
import bham.team.repository.ProfileRepository;
import bham.team.security.SecurityUtils;
import bham.team.service.ActivityService;
import bham.team.service.ActivityService;
import bham.team.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link bham.team.domain.Activity}.
 */
@RestController
@RequestMapping("/api/activities")
@Transactional
public class ActivityResource {

    private static final Logger LOG = LoggerFactory.getLogger(ActivityResource.class);

    private static final String ENTITY_NAME = "activity";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ActivityRepository activityRepository;
    private final ActivityService activityService; // Add this line
    private final ProfileRepository profileRepository;

    public ActivityResource(ActivityRepository activityRepository, ActivityService activityService, ProfileRepository profileRepository) {
        this.activityRepository = activityRepository;
        this.activityService = activityService;
        this.profileRepository = profileRepository;
    }

    /**
     * {@code POST  /activities} : Create a new activity.
     *
     * @param activity the activity to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new activity, or with status {@code 400 (Bad Request)} if the activity has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<Activity> createActivity(@Valid @RequestBody Activity activity) throws URISyntaxException {
        LOG.debug("REST request to save Activity : {}", activity);

        // Get current user login and profile
        String currentUserLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new BadRequestAlertException("Current user login not found", "activity", "userloginnotfound"));

        Profile currentUserProfile = profileRepository
            .findByUserLogin(currentUserLogin)
            .orElseThrow(() -> new BadRequestAlertException("No profile found for current user", "activity", "noprofile"));

        // Set creator and creation timestamps
        activity.setCreator(currentUserProfile);
        activity.setCreatedOn(Instant.now());
        activity.setUpdatedOn(Instant.now());

        if (activity.getId() != null) {
            throw new BadRequestAlertException("A new activity cannot already have an ID", ENTITY_NAME, "idexists");
        }

        activity = activityRepository.save(activity);
        return ResponseEntity.created(new URI("/api/activities/" + activity.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, activity.getId().toString()))
            .body(activity);
    }

    /**
     * {@code PUT  /activities/:id} : Updates an existing activity.
     *
     * @param id the id of the activity to save.
     * @param activity the activity to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated activity,
     * or with status {@code 400 (Bad Request)} if the activity is not valid,
     * or with status {@code 500 (Internal Server Error)} if the activity couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Activity> updateActivity(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody Activity activity
    ) throws URISyntaxException {
        LOG.debug("REST request to update Activity : {}, {}", id, activity);
        if (!activityService.isCurrentUserActivityCreator(id)) {
            throw new BadRequestAlertException("Only the activity creator can update this activity", "activity", "notcreator");
        }

        if (activity.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, activity.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!activityRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        activity = activityRepository.save(activity);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, activity.getId().toString()))
            .body(activity);
    }

    /**
     * {@code PATCH  /activities/:id} : Partial updates given fields of an existing activity, field will ignore if it is null
     *
     * @param id the id of the activity to save.
     * @param activity the activity to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated activity,
     * or with status {@code 400 (Bad Request)} if the activity is not valid,
     * or with status {@code 404 (Not Found)} if the activity is not found,
     * or with status {@code 500 (Internal Server Error)} if the activity couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Activity> partialUpdateActivity(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Activity activity
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Activity partially : {}, {}", id, activity);
        if (activity.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, activity.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!activityRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Activity> result = activityRepository
            .findById(activity.getId())
            .map(existingActivity -> {
                if (activity.getActivityName() != null) {
                    existingActivity.setActivityName(activity.getActivityName());
                }
                if (activity.getActivityType() != null) {
                    existingActivity.setActivityType(activity.getActivityType());
                }
                if (activity.getActivityDate() != null) {
                    existingActivity.setActivityDate(activity.getActivityDate());
                }
                if (activity.getNumberOfParticipants() != null) {
                    existingActivity.setNumberOfParticipants(activity.getNumberOfParticipants());
                }
                if (activity.getMaxNumberOfParticipants() != null) {
                    existingActivity.setMaxNumberOfParticipants(activity.getMaxNumberOfParticipants());
                }
                if (activity.getLocation() != null) {
                    existingActivity.setLocation(activity.getLocation());
                }
                if (activity.getDescription() != null) {
                    existingActivity.setDescription(activity.getDescription());
                }
                if (activity.getCreatedOn() != null) {
                    existingActivity.setCreatedOn(activity.getCreatedOn());
                }
                if (activity.getUpdatedOn() != null) {
                    existingActivity.setUpdatedOn(activity.getUpdatedOn());
                }
                if (activity.getStatus() != null) {
                    existingActivity.setStatus(activity.getStatus());
                }
                if (activity.getCoverImage() != null) {
                    existingActivity.setCoverImage(activity.getCoverImage());
                }
                if (activity.getCoverImageContentType() != null) {
                    existingActivity.setCoverImageContentType(activity.getCoverImageContentType());
                }
                if (activity.getIsPaid() != null) {
                    existingActivity.setIsPaid(activity.getIsPaid());
                }
                if (activity.getActivityCost() != null) {
                    existingActivity.setActivityCost(activity.getActivityCost());
                }

                return existingActivity;
            })
            .map(activityRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, activity.getId().toString())
        );
    }

    /**
     * {@code GET  /activities} : get all the activities.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of activities in body.
     */
    @GetMapping("")
    public List<Activity> getAllActivities() {
        LOG.debug("REST request to get all Activities");
        return activityRepository.findAll();
    }

    /**
     * {@code GET  /activities/:id} : get the "id" activity.
     *
     * @param id the id of the activity to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the activity, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Activity> getActivity(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Activity : {}", id);
        Optional<Activity> activity = activityRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(activity);
    }

    /**
     * {@code DELETE  /activities/:id} : delete the "id" activity.
     *
     * @param id the id of the activity to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivity(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Activity : {}", id);
        if (!activityService.isCurrentUserActivityCreator(id)) {
            throw new BadRequestAlertException("Only the activity creator can delete this activity", "activity", "notcreator");
        }
        activityRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<Activity>> searchActivities(
        @RequestParam String query,
        @RequestParam(required = false) String sort,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        LOG.debug("REST request to search Activities for query {}", query);

        // Create safe Pageable with validated sorting
        Pageable pageable = createSafePageable(page, size, sort);

        Page<Activity> pageResult = activityRepository.findByActivityNameContainingIgnoreCase(query, pageable);

        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), pageResult);
        return ResponseEntity.ok().headers(headers).body(pageResult.getContent());
    }

    private Pageable createSafePageable(int page, int size, String sort) {
        // List of valid sort properties from your entity
        List<String> validProperties = Arrays.asList(
            "id",
            "activityName",
            "activityType",
            "activityDate",
            "location",
            "createdOn",
            "updatedOn",
            "status"
        );

        // Default sort if none provided or invalid
        Sort sortObj = Sort.by(Sort.Direction.ASC, "activityName");

        if (sort != null && !sort.isEmpty()) {
            String[] parts = sort.split(",");
            if (parts.length > 0 && validProperties.contains(parts[0])) {
                Sort.Direction direction = parts.length > 1 && "desc".equalsIgnoreCase(parts[1]) ? Sort.Direction.DESC : Sort.Direction.ASC;
                sortObj = Sort.by(direction, parts[0]);
            }
        }

        return PageRequest.of(page, size, sortObj);
    }

    /**
     * GET /api/activities/my : get all activities created by the current user
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of activities in body
     */
    @GetMapping("/activities/my")
    public ResponseEntity<List<Activity>> getMyActivities(Pageable pageable) {
        LOG.debug("REST request to get current user's activities");

        // Get current user login
        String currentUserLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new BadRequestAlertException("Current user login not found", "activity", "userloginnotfound"));

        // Get current user profile
        Profile currentUserProfile = profileRepository
            .findByUserLogin(currentUserLogin)
            .orElseThrow(() -> new BadRequestAlertException("No profile found for current user", "activity", "noprofile"));

        // Get activities created by current user
        Page<Activity> page = activityRepository.findByCreatorId(currentUserProfile.getId(), pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
