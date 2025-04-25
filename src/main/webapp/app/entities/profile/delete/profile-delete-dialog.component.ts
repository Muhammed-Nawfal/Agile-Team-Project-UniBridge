import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IProfile } from '../profile.model';
import { ProfileService } from '../service/profile.service';

@Component({
  standalone: true,
  templateUrl: './profile-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class ProfileDeleteDialogComponent {
  profile?: IProfile;

  protected profileService = inject(ProfileService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.profileService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
