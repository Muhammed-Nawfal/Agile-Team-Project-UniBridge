import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import RegisterComponent from './register.component';
import { RegisterService } from './register.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let registerService: jest.Mocked<RegisterService>;

  beforeEach(async () => {
    const registerServiceMock = {
      save: jest.fn(),
    } as unknown as jest.Mocked<RegisterService>;

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [RegisterComponent],
      providers: [{ provide: RegisterService, useValue: registerServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    registerService = TestBed.inject(RegisterService) as jest.Mocked<RegisterService>;
    fixture.detectChanges();
  });

  it('should create form with all required controls', () => {
    expect(component).toBeTruthy();
    const form = component.registerForm;
    expect(form.contains('login')).toBe(true);
    expect(form.contains('email')).toBe(true);
    expect(form.contains('firstName')).toBe(true);
    expect(form.contains('lastName')).toBe(true);
    expect(form.contains('password')).toBe(true);
    expect(form.contains('confirmPassword')).toBe(true);
  });

  it('should call save with full payload on submit', () => {
    component.registerForm.setValue({
      login: 'jdoe',
      email: 'jdoe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'abcd',
      confirmPassword: 'abcd',
    });
    registerService.save.mockReturnValue(of({}));

    component.register();

    expect(registerService.save).toHaveBeenCalledWith({
      login: 'jdoe',
      email: 'jdoe@example.com',
      password: 'abcd',
      langKey: 'en',
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(component.success).toBe(true);
  });

  it('should handle login/email and generic errors', () => {
    component.registerForm.setValue({
      login: 'taken',
      email: 'taken@example.com',
      firstName: 'Foo',
      lastName: 'Bar',
      password: '1234',
      confirmPassword: '1234',
    });

    // simulate login taken
    registerService.save.mockReturnValue(throwError(() => ({ status: 400, error: { type: 'LOGIN_ALREADY_USED' } })));
    component.register();
    expect(component.errorUserExists).toBe(true);

    // simulate email taken
    registerService.save.mockReturnValue(throwError(() => ({ status: 400, error: { type: 'EMAIL_ALREADY_USED' } })));
    component.register();
    expect(component.errorEmailExists).toBe(true);

    // simulate generic error
    registerService.save.mockReturnValue(throwError(() => ({ status: 500 })));
    component.register();
    expect(component.error).toBe(true);
  });
});
