// src/main/webapp/app/account/register/register.component.ts

import { AfterViewInit, Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { EMAIL_ALREADY_USED_TYPE, LOGIN_ALREADY_USED_TYPE } from 'app/config/error.constants';
import SharedModule from 'app/shared/shared.module';
import PasswordStrengthBarComponent from '../password/password-strength-bar/password-strength-bar.component';
import { RegisterService } from './register.service';
import { IRegister } from './register.model';
import { Router } from '@angular/router';
import { LoginService } from 'app/login/login.service';

@Component({
  standalone: true,
  selector: 'jhi-register',
  imports: [SharedModule, RouterModule, FormsModule, ReactiveFormsModule, PasswordStrengthBarComponent],
  templateUrl: './register.component.html',
})
export default class RegisterComponent implements AfterViewInit {
  @ViewChild('login', { static: true }) loginField?: ElementRef;

  doNotMatch = signal(false);
  error = signal(false);
  errorUserExists = signal(false);
  errorEmailExists = signal(false);
  success = signal(false);

  registerForm = new FormGroup({
    login: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1), Validators.maxLength(50), Validators.pattern('^[_.@A-Za-z0-9-]+$')],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(254), Validators.email],
    }),
    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
    }),
    lastName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(50)],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(50)],
    }),
  });

  private readonly registerService = inject(RegisterService);
  private readonly loginService = inject(LoginService);

  constructor(protected router: Router) {}

  ngAfterViewInit(): void {
    if (this.loginField?.nativeElement) {
      this.loginField.nativeElement.focus();
    }
  }

  register(): void {
    this.doNotMatch.set(false);
    this.error.set(false);
    this.errorUserExists.set(false);
    this.errorEmailExists.set(false);

    const { password, confirmPassword } = this.registerForm.getRawValue();
    if (password !== confirmPassword) {
      this.doNotMatch.set(true);
      return;
    }

    const { login, email, firstName, lastName } = this.registerForm.getRawValue();
    const payload: IRegister = { login, email, password, langKey: 'en', firstName, lastName };

    this.registerService.save(payload).subscribe({
      next: () => {
        // Auto-login after registration
        this.loginService.login({ username: login, password, rememberMe: true }).subscribe({
          next: () => {
            this.success.set(true);
            this.router.navigate(['/profile/my/edit']);
          },
          error: () => {
            this.success.set(false);
            this.error.set(true);
          },
        });
      },
      error: (response: HttpErrorResponse) => this.processError(response),
    });
  }

  private processError(response: HttpErrorResponse): void {
    if (response.status === 400 && response.error.type === LOGIN_ALREADY_USED_TYPE) {
      this.errorUserExists.set(true);
    } else if (response.status === 400 && response.error.type === EMAIL_ALREADY_USED_TYPE) {
      this.errorEmailExists.set(true);
    } else {
      this.error.set(true);
    }
  }
}
