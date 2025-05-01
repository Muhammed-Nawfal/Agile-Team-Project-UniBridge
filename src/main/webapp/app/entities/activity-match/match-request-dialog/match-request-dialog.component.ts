import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  standalone: true,
  selector: 'jhi-match-request-dialog',
  templateUrl: './match-request-dialog.component.html',
  styleUrls: ['./match-request-dialog.component.scss'],
  imports: [ReactiveFormsModule],
})
export class MatchRequestDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
  ) {
    this.form = this.fb.group({
      date: [null, Validators.required],
      time: ['', Validators.required],
      location: ['', Validators.required],
      notes: [''],
    });
  }

  /** Called when the user clicks “Send Request” */
  submit(): void {
    if (this.form.valid) {
      this.activeModal.close(this.form.value);
    }
  }

  /** Called when the user clicks “Cancel” or the × */
  cancel(): void {
    this.activeModal.dismiss();
  }
}
