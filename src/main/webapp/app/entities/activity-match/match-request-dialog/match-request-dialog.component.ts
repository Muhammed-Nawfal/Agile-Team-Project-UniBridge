import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SpeechService } from '../../../core/speech/speech.service';
import { A11yModule } from 'app/shared/a11y/a11y.module';

@Component({
  standalone: true,
  selector: 'jhi-match-request-dialog',
  templateUrl: './match-request-dialog.component.html',
  styleUrls: ['./match-request-dialog.component.scss'],
  imports: [ReactiveFormsModule, A11yModule],
})
export class MatchRequestDialogComponent {
  form: FormGroup;
  private speechService = inject(SpeechService);

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

  /** Read out the current form values */
  readForm(): void {
    const { date, time, location, notes } = this.form.value;
    const text =
      `Date: ${date || 'not set'}, ` +
      `Time: ${time || 'not set'}, ` +
      `Location: ${location || 'not set'}, ` +
      `Notes: ${notes || 'none'}.`;
    this.speechService.speak(text);
  }
}
