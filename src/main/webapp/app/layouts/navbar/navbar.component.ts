import { Component, OnInit, inject } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import HasAnyAuthorityDirective from 'app/shared/auth/has-any-authority.directive';
import { VERSION } from 'app/app.constants';
import { AccountService } from 'app/core/auth/account.service';
import { LoginService } from 'app/login/login.service';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { IProfile } from 'app/entities/profile/profile.model';
import { EntityNavbarItems } from 'app/entities/entity-navbar-items';
import NavbarItem from './navbar-item.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faUser,
  faComments,
  faTrophy,
  faCalendarCheck,
  faStar,
  faHandshake,
  faSignOutAlt,
  faBookReader,
  faDumbbell,
  faMedal,
  faPeopleGroup,
  faUserFriends,
  faCalendar,
  faRunning,
  faClipboardCheck,
  faBolt,
  faStarHalfAlt,
  faHome,
  faCalendarAlt,
  faUserCircle,
  faUsers,
  faBullseye,
} from '@fortawesome/free-solid-svg-icons';

library.add(
  faUser,
  faComments,
  faTrophy,
  faCalendarCheck,
  faStar,
  faHandshake,
  faSignOutAlt,
  faBookReader,
  faDumbbell,
  faMedal,
  faPeopleGroup,
  faUserFriends,
  faCalendar,
  faRunning,
  faClipboardCheck,
  faBolt,
  faStarHalfAlt,
  faHome,
  faCalendarAlt,
  faUserCircle,
  faUsers,
  faBullseye,
);

@Component({
  standalone: true,
  selector: 'jhi-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  imports: [RouterModule, SharedModule, HasAnyAuthorityDirective, FontAwesomeModule],
})
export default class NavbarComponent implements OnInit {
  version = VERSION.toLowerCase().startsWith('v') ? VERSION : `v${VERSION}`;
  account = inject(AccountService).trackCurrentAccount();
  entitiesNavbarItems: NavbarItem[] = [];

  navLinks = [
    { label: 'Home', route: '/', icon: 'home' },
    { label: 'Profile', route: '/profile', icon: 'user' },
    { label: 'Matches', route: '/activity-match', icon: 'link' }, // using base handshake icon
    { label: 'Activities', route: '/activity', icon: 'star' },
    { label: 'Your Activities', route: '/my-activities', icon: 'calendar-alt' }, // changed to calendar-alt
    { label: 'Your Friends', route: '/friends-list', icon: 'user-friends' },
    { label: 'Booking', route: '/booking', icon: 'calendar-check' },
    { label: 'Challenges', route: '/challenge', icon: 'bullseye' }, // using base bolt icon
    { label: 'Ranking', route: '/ranking', icon: 'trophy' },
    { label: 'Review', route: '/review', icon: 'star' }, // using star-half-alt consistently
  ];

  hiddenRoutes = ['/', '/login', '/account/register', '/profile/my/edit', '/#next-section'];
  showNavbar = true;
  profile: IProfile | null = null;

  private readonly loginService = inject(LoginService);
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);

  constructor() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const cleanPath = event.urlAfterRedirects.split('?')[0];
        this.showNavbar = !this.hiddenRoutes.includes(cleanPath);
      }
    });
  }

  ngOnInit(): void {
    this.entitiesNavbarItems = EntityNavbarItems;

    // Only fetch profile if user is logged in
    const currentAccount = this.account();
    if (currentAccount) {
      this.profileService.findMyProfile().subscribe({
        next: res => {
          this.profile = res.body ?? null;
        },
        error: () => {
          this.profile = null;
        },
      });
    }
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.loginService.logout();
    this.router.navigate(['']);
  }
}
