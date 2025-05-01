import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { DurationPipe, FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
import { IMessageThread } from '../message-thread.model';

@Component({
  standalone: true,
  selector: 'jhi-message-thread-detail',
  templateUrl: './message-thread-detail.component.html',
  imports: [SharedModule, RouterModule, DurationPipe, FormatMediumDatetimePipe, FormatMediumDatePipe],
})
export class MessageThreadDetailComponent {
  messageThread = input<IMessageThread | null>(null);

  previousState(): void {
    window.history.back();
  }
}
