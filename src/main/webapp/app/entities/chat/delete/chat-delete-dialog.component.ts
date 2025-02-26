import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IChat } from '../chat.model';
import { ChatService } from '../service/chat.service';

@Component({
  standalone: true,
  templateUrl: './chat-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class ChatDeleteDialogComponent {
  chat?: IChat;

  protected chatService = inject(ChatService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.chatService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
