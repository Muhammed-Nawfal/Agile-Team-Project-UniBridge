import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AccountService } from 'app/core/auth/account.service';
import { ProfileService } from '../service/profile.service';
import { IProfile } from '../profile.model';

@Component({
  selector: 'jhi-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  profile: IProfile | null = null;
  showEditTip = false;
  hasBio = false;

  private readonly profileService = inject(ProfileService);
  private readonly accountService = inject(AccountService);

  ngOnInit(): void {
    this.accountService.identity().subscribe(account => {
      if (!account?.login) {
        console.error('No account login found');
        return;
      }

      this.profileService.findMyProfile().subscribe({
        next: res => {
          this.profile = res.body ?? null;
          this.hasBio = !!this.profile?.bio;
          this.checkEditTip();
        },
        error(err) {
          console.error('Error loading profile:', err);
        },
      });
    });
  }

  checkEditTip(): void {
    const tipDismissed = localStorage.getItem('profileEditTipDismissed');
    this.showEditTip = !tipDismissed;
  }

  dismissTip(): void {
    localStorage.setItem('profileEditTipDismissed', 'true');
    this.showEditTip = false;
  }
}
