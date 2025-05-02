import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { DurationPipe, FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
import { IActivityParticipant } from '../activity-participant.model';

@Component({
  standalone: true,
  selector: 'jhi-activity-participant-detail',
  templateUrl: './activity-participant-detail.component.html',
  imports: [SharedModule, RouterModule, DurationPipe, FormatMediumDatetimePipe, FormatMediumDatePipe],
})
export class ActivityParticipantDetailComponent {
  activityParticipant = input<IActivityParticipant | null>(null);

  previousState(): void {
    window.history.back();
  }
}
