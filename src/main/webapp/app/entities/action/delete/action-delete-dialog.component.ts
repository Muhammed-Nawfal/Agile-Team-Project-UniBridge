import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IAction } from '../action.model';
import { ActionService } from '../service/action.service';

@Component({
  standalone: true,
  templateUrl: './action-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class ActionDeleteDialogComponent {
  action?: IAction;

  protected actionService = inject(ActionService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.actionService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
