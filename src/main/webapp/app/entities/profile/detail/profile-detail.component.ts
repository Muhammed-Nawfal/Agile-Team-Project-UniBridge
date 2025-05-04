import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../service/profile.service';
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

  constructor(
    private activatedRoute: ActivatedRoute,
    private profileService: ProfileService,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      const id = +params['id'];
      this.profileService.find(id).subscribe(profile => {
        this.profile = profile.body ?? null;
      });
    });
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
}
