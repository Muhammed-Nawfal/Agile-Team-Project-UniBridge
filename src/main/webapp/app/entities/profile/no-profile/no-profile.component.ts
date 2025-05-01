import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from '../service/profile.service';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  standalone: true,
  selector: 'jhi-no-profile',
  templateUrl: './no-profile.component.html',
})
export class NoProfileComponent {
  constructor(
    private profileService: ProfileService,
    private accountService: AccountService,
    private router: Router,
  ) {}

  createProfile(): void {
    this.accountService.identity().subscribe(account => {
      if (account?.login) {
        this.profileService.findUserByLogin(account.login).subscribe(userRes => {
          const user = userRes.body;
          if (user?.id) {
            this.profileService
              .create({
                id: null,
                login: account.login,
                firstName: account.firstName,
                lastName: account.lastName,
                course: 'COMPUTER_SCIENCE',
                courseYear: 1,
                bio: null,
                gymSkill: null,
                gymTime: null,
                gymLocation: null,
                profilePicture: null,
                profilePictureContentType: null,
                sports: null,
                sportsSkill: null,
                studyTime: null,
                user: { id: user.id },
              })
              .subscribe(profileRes => {
                const profile = profileRes.body;
                if (profile?.id) {
                  this.router.navigate(['/profile', profile.id, 'edit']);
                }
              });
          }
        });
      }
    });
  }
}
