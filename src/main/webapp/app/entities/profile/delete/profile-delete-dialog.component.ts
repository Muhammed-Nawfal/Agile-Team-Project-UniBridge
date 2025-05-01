import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertErrorComponent } from 'app/shared/alert/alert-error.component';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'jhi-profile-delete-dialog',
  templateUrl: './profile-delete-dialog.component.html',
  imports: [CommonModule, FontAwesomeModule, AlertErrorComponent],
  providers: [NgbActiveModal],
})
export class ProfileDeleteDialogComponent {
  @Input() profile: { id: number } | null = null;

  constructor(public activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    // implement your deletion logic here
    this.activeModal.close(id);
  }
}
