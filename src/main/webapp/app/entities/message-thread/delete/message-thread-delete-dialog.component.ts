import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IMessageThread } from '../message-thread.model';
import { MessageThreadService } from '../service/message-thread.service';

@Component({
  standalone: true,
  templateUrl: './message-thread-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class MessageThreadDeleteDialogComponent {
  messageThread?: IMessageThread;

  protected messageThreadService = inject(MessageThreadService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.messageThreadService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
