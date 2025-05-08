import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AlertComponent } from './alert/alert.component';
import { AlertErrorComponent } from './alert/alert-error.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  // Navigation & Common Actions
  faArrowLeft,
  faHome,
  faBars,
  faSave,
  faTimes,
  faEye,
  faEdit,
  faTrash,
  faBan,
  faPlus,
  faSync,
  faSearch,

  // User related
  faUser,
  faUserPlus,
  faUserCheck,
  faUserClock,
  faUserFriends,
  faSignInAlt,
  faSignOutAlt,

  // Activity & Events
  faCalendarCheck,
  faCalendarAlt,
  faClock,
  faMapMarkerAlt,
  faHandshake,
  faStar,
  faStarHalfAlt,
  faTrophy,
  faBolt,
  faAward,

  // Communication
  faComments,
  faBell,

  // Accessibility
  faUniversalAccess,
  faTextHeight,
  faAdjust,
  faMoon,
  faSun,
  faHeadphones,

  // Status & Feedback
  faCheckCircle,
  faTimesCircle,
  faExclamationCircle,
  faInfoCircle,

  // New Icons
  faHandshakeAlt,
  faBoltLightning,
  faStarHalf,
  faCalendar,
} from '@fortawesome/free-solid-svg-icons';

@NgModule({
  imports: [AlertComponent, AlertErrorComponent, FontAwesomeModule, CommonModule, NgbModule],
  exports: [CommonModule, NgbModule, FontAwesomeModule, AlertComponent, AlertErrorComponent],
})
export default class SharedModule {
  constructor() {
    // Add all icons
    library.add(
      faArrowLeft,
      faHome,
      faBars,
      faSave,
      faTimes,
      faEye,
      faEdit,
      faTrash,
      faBan,
      faPlus,
      faSync,
      faSearch,
      faUser,
      faUserPlus,
      faUserCheck,
      faUserClock,
      faUserFriends,
      faSignInAlt,
      faSignOutAlt,
      faCalendarCheck,
      faCalendarAlt,
      faClock,
      faMapMarkerAlt,
      faHandshake,
      faStar,
      faStarHalfAlt,
      faTrophy,
      faBolt,
      faAward,
      faComments,
      faBell,
      faUniversalAccess,
      faTextHeight,
      faAdjust,
      faMoon,
      faSun,
      faHeadphones,
      faCheckCircle,
      faTimesCircle,
      faExclamationCircle,
      faInfoCircle,
      faHandshakeAlt,
      faBoltLightning,
      faStarHalf,
      faCalendar,
    );
  }
}
