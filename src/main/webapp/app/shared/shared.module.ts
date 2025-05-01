import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AlertComponent } from './alert/alert.component';
import { AlertErrorComponent } from './alert/alert-error.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCalendarCheck, faUserFriends, faTrophy, faBullhorn, faAward } from '@fortawesome/free-solid-svg-icons';

library.add(faCalendarCheck, faUserFriends, faTrophy, faBullhorn, faAward);

/**
 * Application wide Module
 */
@NgModule({
  imports: [AlertComponent, AlertErrorComponent, FontAwesomeModule],
  exports: [CommonModule, NgbModule, FontAwesomeModule, AlertComponent, AlertErrorComponent],
})
export default class SharedModule {}
