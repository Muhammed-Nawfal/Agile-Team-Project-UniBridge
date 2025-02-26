import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { DurationPipe, FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
import { IActivityMatch } from '../activity-match.model';

@Component({
  standalone: true,
  selector: 'jhi-activity-match-detail',
  templateUrl: './activity-match-detail.component.html',
  imports: [SharedModule, RouterModule, DurationPipe, FormatMediumDatetimePipe, FormatMediumDatePipe],
})
export class ActivityMatchDetailComponent {
  activityMatch = input<IActivityMatch | null>(null);

  previousState(): void {
    window.history.back();
  }
}
