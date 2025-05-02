// src/app/account/register/register.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { IRegister } from './register.model';

@Injectable({ providedIn: 'root' })
export class RegisterService {
  constructor(
    private http: HttpClient,
    private applicationConfigService: ApplicationConfigService,
  ) {}

  /**
   * Send registration data, including login, email, password,
   * langKey, firstName and lastName, to POST /api/register
   */
  save(registerAccount: IRegister): Observable<{}> {
    return this.http.post<{}>(this.applicationConfigService.getEndpointFor('api/register'), registerAccount);
  }
}
