import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IFriendsList } from '../friends-list.model';
import { FriendsListService } from '../service/friends-list.service';

@Component({
  standalone: true,
  templateUrl: './friends-list-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class FriendsListDeleteDialogComponent {
  friendsList?: IFriendsList;

  protected friendsListService = inject(FriendsListService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.friendsListService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
