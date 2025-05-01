import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IChallenge } from '../challenge.model';
import { ChallengeService } from '../service/challenge.service';

@Component({
  standalone: true,
  templateUrl: './challenge-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class ChallengeDeleteDialogComponent {
  challenge?: IChallenge;

  protected challengeService = inject(ChallengeService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.challengeService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
