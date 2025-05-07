import { Component, inject, AfterViewInit } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import dayjs from 'dayjs/esm';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import locale from '@angular/common/locales/en';
// jhipster-needle-angular-add-module-import JHipster will add new module here

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { fontAwesomeIcons } from './config/font-awesome-icons';
import MainComponent from './layouts/main/main.component';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { addIconsToLibrary } from './core/icons/icons';

library.add(faMapMarkerAlt);

import AOS from 'aos';

@Component({
  standalone: true,
  selector: 'jhi-app',
  template: '<jhi-main></jhi-main>',
  imports: [
    MainComponent,
    // jhipster-needle-angular-add-module JHipster will add new module here
  ],
})
export default class AppComponent implements AfterViewInit {
  private readonly applicationConfigService = inject(ApplicationConfigService);
  private readonly iconLibrary = inject(FaIconLibrary);
  private readonly dpConfig = inject(NgbDatepickerConfig);

  constructor() {
    this.applicationConfigService.setEndpointPrefix(SERVER_API_URL);
    registerLocaleData(locale);
    this.iconLibrary.addIcons(...fontAwesomeIcons);
    this.dpConfig.minDate = { year: dayjs().subtract(100, 'year').year(), month: 1, day: 1 };
    addIconsToLibrary(); // ✅ Proper call here
  }

  ngAfterViewInit(): void {
    AOS.init({ duration: 1000, once: true });
  }
}
