import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertErrorComponent } from 'app/shared/alert/alert-error.component';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../service/profile.service';
import { AccountService } from 'app/core/auth/account.service';
import { UserService } from 'app/entities/user/service/user.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'jhi-profile-delete-dialog',
  templateUrl: './profile-delete-dialog.component.html',
  imports: [CommonModule, FontAwesomeModule, AlertErrorComponent],
  providers: [NgbActiveModal],
})
export class ProfileDeleteDialogComponent implements OnInit {
  @Input() profile: { id: number } | null = null;

  login: string | null = null;

  constructor(
    protected profileService: ProfileService,
    protected userService: UserService,
    protected accountService: AccountService,
    protected activeModal: NgbActiveModal,
    protected router: Router,
  ) {}

  ngOnInit(): void {
    this.accountService.identity().subscribe(account => {
      if (account) {
        const login = account.login;
        this.profileService.findUserByLogin(login).subscribe(profile => {
          this.profile = profile.body ?? null;
        });
        this.login = login;
      }
    });
  }

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(profileId: number): void {
    if (!this.login) return;

    // Step 1: Delete Profile
    this.profileService.delete(profileId).subscribe(() => {
      // Step 2: Delete User Account
      this.accountService.deleteAccount().subscribe(() => {
        this.activeModal.close('deleted');
        this.router.navigate(['/logout']);
      });
    });
  }
}
