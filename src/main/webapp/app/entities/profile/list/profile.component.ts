import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import SharedModule from 'app/shared/shared.module';
import { AccountService } from 'app/core/auth/account.service';
import { ProfileService } from '../service/profile.service';
import { IProfile } from '../profile.model';
import { RankingService } from 'app/entities/ranking/service/ranking.service';

@Component({
  selector: 'jhi-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule, SharedModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  starAverage: number | null = null;
  profile: IProfile | null = null;
  showEditTip = false;
  hasBio = false;

  private readonly profileService = inject(ProfileService);
  private readonly accountService = inject(AccountService);
  private readonly rankingService = inject(RankingService);
  private readonly router = inject(Router);

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
          if (this.profile?.id) {
            this.rankingService.getRankingsByProfile(this.profile.id).subscribe(response => {
              const rankings = response.body ?? [];

              if (rankings.length === 0) {
                console.error('No rankings found for profile ID:', this.profile?.id);
                return;
              }

              const ranking = rankings[0];
              if (ranking.starAverage != null) {
                this.starAverage = Math.round(ranking.starAverage);
              } else {
                console.warn('Ranking found, but starAverage is null');
              }
            });
          }

          this.checkEditTip();
        },
        error(err) {
          console.error('Error loading profile:', err);
        },
      });
    });
  }

  goToRanking(): void {
    this.router.navigate(['/ranking']);
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
