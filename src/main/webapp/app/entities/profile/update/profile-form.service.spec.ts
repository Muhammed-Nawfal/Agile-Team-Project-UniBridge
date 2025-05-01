import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';

import { sampleWithNewData, sampleWithRequiredData } from '../profile.test-samples';

import { ProfileFormService } from './profile-form.service';

describe('Profile Form Service', () => {
  let service: ProfileFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfileFormService);
  });

  describe('Service methods', () => {
    describe('createProfileFormGroup', () => {
      it('should create a form with default controls', () => {
        const formGroup = service.createProfileFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(FormControl),
            login: expect.any(FormControl),
            firstName: expect.any(FormControl),
            lastName: expect.any(FormControl),
            bio: expect.any(FormControl),
            profilePicture: expect.any(FormControl),
            profilePictureContentType: expect.any(FormControl),
            course: expect.any(FormControl),
            courseYear: expect.any(FormControl),
            gymSkill: expect.any(FormControl),
            gymLocation: expect.any(FormControl),
            gymTime: expect.any(FormControl),
            studyTime: expect.any(FormControl),
            sports: expect.any(FormControl),
            sportsSkill: expect.any(FormControl),
            user: expect.any(FormControl),
          }),
        );
      });

      it('should initialize form with IProfile data', () => {
        const formGroup = service.createProfileFormGroup(sampleWithRequiredData);

        expect(formGroup.value).toEqual({
          id: sampleWithRequiredData.id,
          login: sampleWithRequiredData.login,
          firstName: sampleWithRequiredData.firstName,
          lastName: sampleWithRequiredData.lastName,
          bio: sampleWithRequiredData.bio,
          profilePicture: sampleWithRequiredData.profilePicture,
          profilePictureContentType: sampleWithRequiredData.profilePictureContentType,
          course: sampleWithRequiredData.course,
          courseYear: sampleWithRequiredData.courseYear,
          gymSkill: sampleWithRequiredData.gymSkill,
          gymLocation: sampleWithRequiredData.gymLocation,
          gymTime: sampleWithRequiredData.gymTime,
          studyTime: sampleWithRequiredData.studyTime,
          sports: sampleWithRequiredData.sports,
          sportsSkill: sampleWithRequiredData.sportsSkill,
          user: sampleWithRequiredData.user,
        });
      });

      it('passing NewProfile should disable id and set login, firstName, lastName', () => {
        const formGroup = service.createProfileFormGroup(sampleWithNewData);

        expect(formGroup.controls.id.disabled).toBe(true);
        expect(formGroup.controls.login.value).toBe(sampleWithNewData.login);
        expect(formGroup.controls.firstName.value).toBe(sampleWithNewData.firstName);
        expect(formGroup.controls.lastName.value).toBe(sampleWithNewData.lastName);
      });

      it('passing NewProfile should keep id disabled on reset', () => {
        const formGroup = service.createProfileFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null, login: '', firstName: '', lastName: '' });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });

    describe('getProfile', () => {
      it('should return NewProfile for empty initial value', () => {
        const formGroup = service.createProfileFormGroup();
        const profile = service.getProfile(formGroup) as any;

        expect(profile).toEqual({
          id: null,
          login: '',
          firstName: '',
          lastName: '',
          bio: null,
          profilePicture: null,
          profilePictureContentType: null,
          course: null,
          courseYear: null,
          gymSkill: null,
          gymLocation: null,
          gymTime: null,
          studyTime: null,
          sports: null,
          sportsSkill: null,
          user: null,
        });
      });

      it('should return IProfile', () => {
        const formGroup = service.createProfileFormGroup(sampleWithRequiredData);
        const profile = service.getProfile(formGroup);

        expect(profile).toEqual(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('should reset form including login, firstName and lastName', () => {
        const formGroup = service.createProfileFormGroup();
        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.login.value).toBe(sampleWithRequiredData.login);
        expect(formGroup.controls.firstName.value).toBe(sampleWithRequiredData.firstName);
        expect(formGroup.controls.lastName.value).toBe(sampleWithRequiredData.lastName);
      });
    });
  });
});
