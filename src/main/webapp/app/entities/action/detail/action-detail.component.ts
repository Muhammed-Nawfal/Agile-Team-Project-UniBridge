import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { DurationPipe, FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
import { IAction } from '../action.model';

@Component({
  standalone: true,
  selector: 'jhi-action-detail',
  templateUrl: './action-detail.component.html',
  imports: [SharedModule, RouterModule, DurationPipe, FormatMediumDatetimePipe, FormatMediumDatePipe],
})
export class ActionDetailComponent {
  action = input<IAction | null>(null);

  previousState(): void {
    window.history.back();
  }
}
