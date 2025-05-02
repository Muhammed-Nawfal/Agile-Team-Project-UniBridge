import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { ITimeSlot } from '../time-slot.model';
import { TimeSlotService } from '../service/time-slot.service';

@Component({
  standalone: true,
  templateUrl: './time-slot-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class TimeSlotDeleteDialogComponent {
  timeSlot?: ITimeSlot;

  protected timeSlotService = inject(TimeSlotService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.timeSlotService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
