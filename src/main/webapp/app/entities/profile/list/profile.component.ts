/* eslint-disable no-console */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from '../service/profile.service';
import { AccountService } from 'app/core/auth/account.service';
import { IProfile } from '../profile.model';
import { Account } from 'app/core/auth/account.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'jhi-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profile: IProfile | null = null;
  account: Account | null = null;
  user: { id: number; login: string } | null = null;
  showEditTip = false;

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected profileService: ProfileService,
    protected accountService: AccountService,
    protected router: Router,
  ) {}

  ngOnInit(): void {
    this.loadAccountDetails();

    // Show tip only if it hasn't been dismissed before
    const tipDismissed = sessionStorage.getItem('editProfileTipDismissed');
    if (!tipDismissed) {
      this.showEditTip = true;
    }
  }

  dismissTip(): void {
    this.showEditTip = false;
    sessionStorage.setItem('editProfileTipDismissed', 'true');
  }

  // Step 1: Get account info
  loadAccountDetails(): void {
    this.accountService.identity().subscribe(account => {
      if (account) {
        this.account = account;
        console.log('✅ Account Data Loaded:', this.account);
        this.loadProfile();
      }
    });
  }

  get hasBio(): boolean {
    return !!this.profile?.bio && this.profile.bio.trim().length > 0;
  }

  // Step 2: Get user by login, then profile by user ID
  loadProfile(): void {
    if (!this.account?.login) {
      console.warn('⚠️ No valid account login found.');
      return;
    }

    const accountLogin = this.account.login;
    console.log(`🔄 Fetching user with login=${accountLogin}`);

    this.profileService.findUserByLogin(accountLogin).subscribe({
      next: userResponse => {
        if (!userResponse.body) {
          console.warn(`⚠️ No user found for login=${accountLogin}`);
          return;
        }

        const user = userResponse.body;
        console.log('✅ Found user:', user);
        this.user = {
          id: user.id,
          login: user.login ?? 'unknown',
        };

        this.profileService.find(user.id).subscribe({
          next: profileResponse => {
            const profile = profileResponse.body;
            if (!profile?.id) {
              console.warn(`⚠️ Profile is missing or incomplete for user id=${user.id}`);
              this.router.navigate(['/no-profile']);
              return;
            }

            this.profile = profile;

            this.profile = profileResponse.body;
            console.log('✅ Profile Data Loaded:', this.profile);
          },
          error: err => {
            console.error('❌ Error fetching profile:', err);
            this.router.navigate(['/no-profile']);
          },
        });
      },
      error(err) {
        console.error('❌ Error fetching user:', err);
      },
    });
  }
}
