import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AccountService } from 'app/core/auth/account.service';
import { AppPageTitleStrategy } from 'app/app-page-title-strategy';
import FooterComponent from '../footer/footer.component';
import PageRibbonComponent from '../profiles/page-ribbon.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// Import the accessibility component
import { AccessibilityComponent } from 'app/shared/accessibility/accessibility.component';
import { GlobalAccessibilityDirective } from '../../shared/a11y/global-accessibility.directive';
import { register } from 'swiper/element/bundle';
import NavbarComponent from '../navbar/navbar.component';

register();

import { library } from '@fortawesome/fontawesome-svg-core';
import { faUser, faComments, faTrophy, faCalendarCheck, faStar, faHandshake, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

library.add(faUser, faComments, faTrophy, faCalendarCheck, faStar, faHandshake, faSignOutAlt);

import { ViewChild } from '@angular/core';
import { NgClass } from '@angular/common';
import SharedModule from 'app/shared/shared.module';
import { fontAwesomeIcons } from 'app/config/font-awesome-icons';

@Component({
  standalone: true,
  selector: 'jhi-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  providers: [AppPageTitleStrategy],
  imports: [
    RouterOutlet,
    FooterComponent,
    PageRibbonComponent,
    AccessibilityComponent,
    GlobalAccessibilityDirective,
    NavbarComponent,
    NgClass,
    SharedModule,
    CommonModule,
    FontAwesomeModule,
  ],
})
export default class MainComponent implements OnInit {
  @ViewChild(NavbarComponent) navbarComponent?: NavbarComponent;

  showNavbar = true;

  private readonly router = inject(Router);
  private readonly appPageTitleStrategy = inject(AppPageTitleStrategy);
  private readonly accountService = inject(AccountService);

  ngOnInit(): void {
    // try to log in automatically
    this.accountService.identity().subscribe();
  }
  ngAfterViewInit(): void {
    // Update `showNavbar` after view is ready
    setTimeout(() => {
      this.showNavbar = this.navbarComponent?.showNavbar ?? true;
    });
  }
}
