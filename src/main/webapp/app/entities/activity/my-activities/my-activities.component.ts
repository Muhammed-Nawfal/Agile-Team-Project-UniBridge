import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IActivityParticipant } from '../../activity-participant/activity-participant.model';
import { ActivityParticipantService } from '../../activity-participant/service/activity-participant.service';
import FormatMediumDatetimePipe from '../../../shared/date/format-medium-datetime.pipe';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AlertErrorComponent } from '../../../shared/alert/alert-error.component';
import { AlertComponent } from '../../../shared/alert/alert.component';
import { Status } from '../../enumerations/status.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { forkJoin, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { IActivity } from '../../activity/activity.model';

@Component({
  selector: 'jhi-my-activities',
  standalone: true,
  imports: [CommonModule, FormatMediumDatetimePipe, RouterLink, AlertErrorComponent, AlertComponent, FontAwesomeModule],
  templateUrl: './my-activities.component.html',
  styleUrl: './my-activities.component.scss',
})
export class MyActivitiesComponent implements OnInit {
  userActivities: IActivityParticipant[] = [];
  isLoading = false;
  error = false;
  errorMessage = '';

  constructor(
    protected activityParticipantService: ActivityParticipantService,
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
  ) {}

  ngOnInit(): void {
    this.loadUserActivities();
  }

  loadUserActivities(): void {
    this.isLoading = true;
    this.error = false;

    this.activityParticipantService.getUserActivities().subscribe({
      next: activities => {
        // Check if we need to load additional activity details
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (activities && activities.length > 0) {
          this.loadActivityDetails(activities);
        } else {
          this.userActivities = activities;
          this.isLoading = false;
        }
      },
      error: error => {
        this.error = true;
        this.errorMessage = error.message || 'Error loading your activities';
        this.isLoading = false;
      },
    });
  }

  /**
   * For each activity participant, fetch complete activity details if needed
   */
  loadActivityDetails(participants: IActivityParticipant[]): void {
    // First, check if we need to load additional details
    const needsAdditionalDetails = participants.some(p => p.activity && (!p.activity.activityDate || !p.activity.location));

    if (!needsAdditionalDetails) {
      // All data seems to be available, use as is
      this.userActivities = participants;
      this.isLoading = false;
      return;
    }

    // We need to fetch additional details for activities
    const requests = participants.map(participant => {
      if (participant.activity?.id) {
        // Fetch complete activity details
        return this.activityParticipantService.getActivityDetails(participant.activity.id).pipe(
          map(response => {
            // Update the activity property with the full details
            participant.activity = response.body ?? participant.activity;
            return participant;
          }),
          catchError(() => {
            // If activity details fetch fails, return original participant
            return of(participant);
          }),
        );
      }
      return of(participant);
    });

    // Execute all requests in parallel
    forkJoin(requests).subscribe({
      next: updatedParticipants => {
        this.userActivities = updatedParticipants;
        this.isLoading = false;
      },
      error: error => {
        this.error = true;
        this.errorMessage = error.message || 'Error loading activity details';
        this.isLoading = false;
      },
    });
  }

  viewActivityDetails(activityId: number | undefined): void {
    if (activityId) {
      this.router.navigate(['/activity', activityId, 'view']);
    }
  }

  // Then add a method to get a display-friendly version of the status
  getStatusDisplay(status: Status | undefined): string {
    if (!status) {
      return 'Unknown';
    }

    // Convert enum values to more readable text
    switch (status) {
      case Status.ANNOUNCED:
        return 'Announced';
      case Status.CURRENTLY_HAPPENING:
        return 'In Progress';
      case Status.FINISHED:
        return 'Finished';
      case Status.CANCELED:
        return 'Canceled';
      default:
        return 'Unknown';
    }
  }

  // For status badge styling
  getBadgeClass(status: Status | undefined): string {
    if (!status) {
      return 'badge bg-secondary';
    }

    switch (status) {
      case Status.ANNOUNCED:
        return 'badge bg-info';
      case Status.CURRENTLY_HAPPENING:
        return 'badge bg-success';
      case Status.FINISHED:
        return 'badge bg-secondary';
      case Status.CANCELED:
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  // Helper methods for the template
  trackId = (_index: number, item: IActivityParticipant): number => item.id;
}
