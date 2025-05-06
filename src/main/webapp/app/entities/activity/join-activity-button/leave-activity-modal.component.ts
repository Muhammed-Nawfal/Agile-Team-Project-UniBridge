import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'jhi-leave-activity-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Confirm Leave Activity</h4>
      <button type="button" class="btn-close" aria-label="Close" (click)="dismiss()"></button>
    </div>
    <div class="modal-body">
      <p>Are you sure you want to leave this activity?</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="dismiss()">Cancel</button>
      <button type="button" class="btn btn-danger" (click)="confirm()">Leave Activity</button>
    </div>
  `,
})
export class LeaveActivityModalComponent {
  @Input() activityId!: number;

  constructor(public activeModal: NgbActiveModal) {}

  confirm(): void {
    this.activeModal.close('confirm');
  }

  dismiss(): void {
    this.activeModal.dismiss();
  }
}
