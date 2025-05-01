import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../service/profile.service';
import { AccountService } from 'app/core/auth/account.service';
import { UserService } from 'app/entities/user/service/user.service';
import { IProfile } from '../profile.model';
import { Account } from 'app/core/auth/account.model';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'jhi-profile-detail',
  imports: [CommonModule],
  templateUrl: './profile-detail.component.html',
})
export class ProfileDetailComponent implements OnInit {
  profile: IProfile | null = null;
  isFollowing = false;
  showFollowTip = false;
  account: Account | null = null;
  fullName = '';

  private idToLoginMap: Record<number, string> = {
    2: 'user',
    1: 'admin',
    3: 'test1',
    4: 'test2',
    5: 'test3',
    6: 'test4',
    7: 'test5',
    8: 'test6',
    9: 'test7',
    10: 'test8',
    // Add more mappings as needed
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private profileService: ProfileService,
    private accountService: AccountService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    const tipDismissed = sessionStorage.getItem('followTipDismissed');
    this.showFollowTip = !tipDismissed;

    const profileId = this.activatedRoute.snapshot.params['id'];
    if (profileId) {
      this.profileService.find(profileId).subscribe({
        next: res => {
          this.profile = res.body;

          if (this.profile?.login) {
            this.fetchAccountDetails(this.profile.login);
          } else if (this.profile?.id && this.idToLoginMap[this.profile.id]) {
            const login = this.idToLoginMap[this.profile.id];
            this.fetchAccountDetails(login);
          }
        },
        error(err) {
          console.error('Error loading profile:', err);
        },
      });
    }
  }
  dismissTip(): void {
    this.showFollowTip = false;
    sessionStorage.setItem('followTipDismissed', 'true');
  }

  toggleFollow(): void {
    this.isFollowing = !this.isFollowing;
  }

  onMessage(): void {
    if (!this.isFollowing) {
      alert('⚠️ You must follow this user to message them.');
    } else {
      alert('📬 Opening message interface...');
    }
  }

  private fetchAccountDetails(login: string): void {
    this.accountService.getAccountByLogin(login).subscribe(accountResponse => {
      this.fullName = `${accountResponse.firstName ?? ''} ${accountResponse.lastName ?? ''}`.trim();
    });
  }
}
