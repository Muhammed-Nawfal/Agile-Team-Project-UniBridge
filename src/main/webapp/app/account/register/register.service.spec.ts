import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { RegisterService } from './register.service';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { IRegister } from './register.model';

describe('RegisterService', () => {
  let service: RegisterService;
  let httpMock: HttpTestingController;
  let appConfig: ApplicationConfigService;
  let resourceUrl: string;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting(), RegisterService, ApplicationConfigService],
    });
    service = TestBed.inject(RegisterService);
    httpMock = TestBed.inject(HttpTestingController);
    appConfig = TestBed.inject(ApplicationConfigService);
    resourceUrl = appConfig.getEndpointFor('api/register');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should POST registration data including firstName and lastName', () => {
    const mockAccount: IRegister = {
      login: 'jdoe',
      email: 'jdoe@example.com',
      password: '1234',
      langKey: 'en',
      firstName: 'John',
      lastName: 'Doe',
    };

    service.save(mockAccount).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(resourceUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockAccount);
    req.flush({});
  });
});
