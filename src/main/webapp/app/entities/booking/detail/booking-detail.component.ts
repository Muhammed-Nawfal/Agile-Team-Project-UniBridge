import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { DurationPipe, FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
import { IBooking } from '../booking.model';

@Component({
  standalone: true,
  selector: 'jhi-booking-detail',
  templateUrl: './booking-detail.component.html',
  imports: [SharedModule, RouterModule, DurationPipe, FormatMediumDatetimePipe, FormatMediumDatePipe],
})
export class BookingDetailComponent {
  booking = input<IBooking | null>(null);

  previousState(): void {
    window.history.back();
  }
}
