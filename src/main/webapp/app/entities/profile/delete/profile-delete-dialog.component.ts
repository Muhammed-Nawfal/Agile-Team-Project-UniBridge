import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertErrorComponent } from 'app/shared/alert/alert-error.component';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../service/profile.service';
import { AccountService } from 'app/core/auth/account.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'jhi-profile-delete-dialog',
  templateUrl: './profile-delete-dialog.component.html',
  imports: [CommonModule, FontAwesomeModule, AlertErrorComponent],
  providers: [NgbActiveModal],
})
export class ProfileDeleteDialogComponent implements OnInit {
  profileId: number | null = null;

  constructor(
    protected profileService: ProfileService,
    protected accountService: AccountService,
    protected activeModal: NgbActiveModal,
    protected router: Router,
  ) {}

  ngOnInit(): void {
    this.profileService.findMyProfile().subscribe(myProfileRes => {
      const profile = myProfileRes.body;
      if (profile) {
        this.profileId = profile.id;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/profile']);
    this.activeModal.dismiss();
  }

  anonymizeProfile(): void {
    if (!this.profileId) return;

    this.profileService.anonymize(this.profileId).subscribe(() => {
      this.activeModal.close('anonymized');
      this.router.navigate(['/profile/my/edit']);
    });
  }
}
