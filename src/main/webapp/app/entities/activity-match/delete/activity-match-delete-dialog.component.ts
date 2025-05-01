import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IActivityMatch } from '../activity-match.model';
import { ActivityMatchService } from '../service/activity-match.service';

@Component({
  standalone: true,
  templateUrl: './activity-match-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class ActivityMatchDeleteDialogComponent {
  activityMatch?: IActivityMatch;

  protected activityMatchService = inject(ActivityMatchService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.activityMatchService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
