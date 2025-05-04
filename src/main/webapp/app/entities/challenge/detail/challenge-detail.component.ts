import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { DurationPipe, FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
import { DataUtils } from 'app/core/util/data-util.service';
import { IChallenge } from '../challenge.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChallengeDeleteDialogComponent } from '../delete/challenge-delete-dialog.component';

@Component({
  standalone: true,
  selector: 'jhi-challenge-detail',
  templateUrl: './challenge-detail.component.html',
  imports: [SharedModule, RouterModule, DurationPipe, FormatMediumDatetimePipe, FormatMediumDatePipe],
})
export class ChallengeDetailComponent {
  challenge = input<IChallenge | null>(null);

  protected dataUtils = inject(DataUtils);
  protected modalService = inject(NgbModal);

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  previousState(): void {
    window.history.back();
  }

  delete(challenge: IChallenge): void {
    const modalRef = this.modalService.open(ChallengeDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.challenge = challenge;
  }
}
