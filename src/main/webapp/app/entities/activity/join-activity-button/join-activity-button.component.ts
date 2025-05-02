import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApplicationConfigService } from '../../../core/config/application-config.service';
import { ActivityParticipantService } from '../../activity-participant/service/activity-participant.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgClass } from '@angular/common';

@Component({
  selector: 'jhi-join-activity-button',
  standalone: true,
  imports: [NgClass],
  templateUrl: './join-activity-button.component.html',
  styleUrl: './join-activity-button.component.scss',
})
export class JoinActivityButtonComponent implements OnInit {
  @Input() activityId!: number;
  @Input() buttonText = 'Join Activity';
  @Input() joinedText = 'Joined';
  @Input() fullText = 'Activity Full';
  @Input() cssClass = 'btn btn-primary';

  hasJoined = false;
  isLoading = false;
  errorMessage: string | null = null;
  isFull = false;

  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private applicationConfigService: ApplicationConfigService,
    private activityParticipantService: ActivityParticipantService,
  ) {
    this.apiUrl = this.applicationConfigService.getEndpointFor('api/activity-participants');
  }

  ngOnInit(): void {
    this.checkIfJoined();
  }
  // method to join activity
  joinActivity(): void {
    if (this.hasJoined || this.isLoading || this.isFull) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    // Using the activity participant service class
    this.activityParticipantService.joinActivity(this.activityId).subscribe({
      next: () => {
        this.hasJoined = true;
        this.isLoading = false;
      },
      error: error => {
        this.isLoading = false;

        if (error.error?.title === 'Activity is already full') {
          this.isFull = true;
          this.errorMessage = 'This activity is full';
        } else if (error.error?.title === 'You have already joined this activity') {
          this.hasJoined = true;
          this.errorMessage = null;
        } else if (error.error?.title === 'Activity is not open for joining') {
          this.errorMessage = 'This activity is not open for joining';
        } else if (error.error?.title === 'Activity not found') {
          this.errorMessage = 'Activity not found';
        } else {
          this.errorMessage = `Error joining activity: ${error.status ? `${error.status} - ` : ''}${error.message || 'Unknown error'}`;
        }

        console.error('Error joining activity', error);
      },
    });
  }

  private checkIfJoined(): void {
    this.isLoading = true;
    // Using the service instead of direct HTTP calls
    this.activityParticipantService.hasUserJoinedActivity(this.activityId).subscribe({
      next: hasJoined => {
        this.hasJoined = hasJoined;
        this.isLoading = false;
      },
      error: error => {
        this.isLoading = false;
        this.errorMessage = 'Error checking join status';
        console.error('Error checking if joined activity', error);
      },
    });
  }
}
