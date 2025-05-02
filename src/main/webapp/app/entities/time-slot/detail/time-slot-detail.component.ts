import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { DurationPipe, FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
import { ITimeSlot } from '../time-slot.model';

@Component({
  standalone: true,
  selector: 'jhi-time-slot-detail',
  templateUrl: './time-slot-detail.component.html',
  imports: [SharedModule, RouterModule, DurationPipe, FormatMediumDatetimePipe, FormatMediumDatePipe],
})
export class TimeSlotDetailComponent {
  timeSlot = input<ITimeSlot | null>(null);

  previousState(): void {
    window.history.back();
  }
}
