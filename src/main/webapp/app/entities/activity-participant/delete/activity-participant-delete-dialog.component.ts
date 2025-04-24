import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IActivityParticipant } from '../activity-participant.model';
import { ActivityParticipantService } from '../service/activity-participant.service';

@Component({
  standalone: true,
  templateUrl: './activity-participant-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class ActivityParticipantDeleteDialogComponent {
  activityParticipant?: IActivityParticipant;

  protected activityParticipantService = inject(ActivityParticipantService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.activityParticipantService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
