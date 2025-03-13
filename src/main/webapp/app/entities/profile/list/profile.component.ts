/* eslint-disable no-console */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected profileService: ProfileService,
    protected accountService: AccountService,
  ) {}

  ngOnInit(): void {
    this.loadAccountDetails();
  }

  // Load Account Details First
  loadAccountDetails(): void {
    this.accountService.identity().subscribe(account => {
      if (account) {
        this.account = account;
        console.log('✅ Account Data Loaded:', this.account);

        // Fetch user => then profile
        this.loadProfile();
      }
    });
  }

  // Two-step fetch:
  // 1) GET /api/admin/users/{login}  => gets the user
  // 2) GET /api/profiles/{id}       => gets the profile
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
          login: user.login ?? 'unknown', // Fallback to "unknown" if null or undefined
        };

        // Now fetch the profile by user.id
        this.profileService.find(user.id).subscribe({
          next: profileResponse => {
            if (!profileResponse.body) {
              console.warn(`⚠️ No profile found for user id=${user.id}`);
              return;
            }
            this.profile = profileResponse.body;
            console.log('✅ Profile Data Loaded:', this.profile);
          },
          error(err) {
            console.error('❌ Error fetching profile:', err);
          },
        });
      },
      error(err) {
        console.error('❌ Error fetching user:', err);
      },
    });
  }
}
