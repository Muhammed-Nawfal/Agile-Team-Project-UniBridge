import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IRanking } from '../ranking.model';
import { RankingService } from '../service/ranking.service';

@Component({
  standalone: true,
  templateUrl: './ranking-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class RankingDeleteDialogComponent {
  ranking?: IRanking;

  protected rankingService = inject(RankingService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.rankingService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
