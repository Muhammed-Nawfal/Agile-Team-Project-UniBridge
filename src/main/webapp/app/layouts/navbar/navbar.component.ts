import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import SharedModule from 'app/shared/shared.module';
import HasAnyAuthorityDirective from 'app/shared/auth/has-any-authority.directive';
import { AccountService } from 'app/core/auth/account.service';
import { LoginService } from 'app/login/login.service';
import { ProfileService } from 'app/entities/profile/service/profile.service'; // ✅ Use profile from entities
import { IProfile } from 'app/entities/profile/profile.model';
import { EntityNavbarItems } from 'app/entities/entity-navbar-items';
import NavbarItem from './navbar-item.model';
import { VERSION } from 'app/app.constants';

@Component({
  standalone: true,
  selector: 'jhi-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  imports: [RouterModule, CommonModule, SharedModule, HasAnyAuthorityDirective],
})
export default class NavbarComponent implements OnInit {
  version = VERSION.toLowerCase().startsWith('v') ? VERSION : `v${VERSION}`;
  account = inject(AccountService).trackCurrentAccount();
  entitiesNavbarItems: NavbarItem[] = [];

  currentRouteHidden = false;
  hiddenRoutes = ['/login', '/account/register'];

  profile: IProfile | null = null;

  // Services
  private readonly loginService = inject(LoginService);
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);

  constructor() {
    this.router.events.subscribe(() => {
      const path = this.router.url;
      this.currentRouteHidden = this.hiddenRoutes.includes(path);
    });
  }

  ngOnInit(): void {
    this.entitiesNavbarItems = EntityNavbarItems;

    // Fetch full user profile (for picture, name, etc.)
    this.profileService.findMyProfile().subscribe(res => {
      this.profile = res.body ?? null;
    });
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.loginService.logout();
    this.router.navigate(['']);
  }
}
