import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { DurationPipe, FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
import { DataUtils } from 'app/core/util/data-util.service';
import { IActivity } from '../activity.model';
import { JoinActivityButtonComponent } from '../join-activity-button/join-activity-button.component';
import { LeaveActivityModalComponent } from '../join-activity-button/leave-activity-modal.component';

@Component({
  standalone: true,
  selector: 'jhi-activity-detail',
  templateUrl: './activity-detail.component.html',
  styleUrl: 'activity-detail.component.scss',
  imports: [
    SharedModule,
    RouterModule,
    DurationPipe,
    FormatMediumDatetimePipe,
    FormatMediumDatePipe,
    JoinActivityButtonComponent,
    LeaveActivityModalComponent,
  ],
})
export class ActivityDetailComponent {
  activity = input<IActivity | null>(null);

  protected dataUtils = inject(DataUtils);

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  previousState(): void {
    window.history.back();
  }
}
