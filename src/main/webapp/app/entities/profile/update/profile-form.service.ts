import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IProfile, NewProfile } from '../profile.model';
import { IUser } from 'app/entities/user/user.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IProfile for edit and NewProfileFormGroupInput for create.
 */
type ProfileFormGroupInput = IProfile | PartialWithRequiredKeyOf<NewProfile>;

type ProfileFormDefaults = Pick<NewProfile, 'id'>;

type ProfileFormGroupContent = {
  id: FormControl;
  bio: FormControl<IProfile['bio']>;
  profilePicture: FormControl<IProfile['profilePicture']>;
  profilePictureContentType: FormControl<IProfile['profilePictureContentType']>;
  course: FormControl<IProfile['course']>;
  courseYear: FormControl<IProfile['courseYear']>;
  gymSkill: FormControl<IProfile['gymSkill']>;
  gymLocation: FormControl<IProfile['gymLocation']>;
  gymTime: FormControl<IProfile['gymTime']>;
  studyTime: FormControl<IProfile['studyTime']>;
  sports: FormControl<IProfile['sports']>;
  sportsSkill: FormControl<IProfile['sportsSkill']>;
  user: FormControl<IUser | null | undefined>;
};

export type ProfileFormGroup = FormGroup<ProfileFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ProfileFormService {
  createProfileFormGroup(profile: ProfileFormGroupInput = { id: null }): ProfileFormGroup {
    const profileRawValue = {
      ...this.getFormDefaults(),
      ...profile,
    };

    return new FormGroup<ProfileFormGroupContent>({
      // Remove `nonNullable: true` so `id` can be null.
      id: new FormControl(
        { value: profileRawValue.id, disabled: true },
        {
          validators: [Validators.required],
        },
      ),
      bio: new FormControl(profileRawValue.bio),
      profilePicture: new FormControl(profileRawValue.profilePicture),
      profilePictureContentType: new FormControl(profileRawValue.profilePictureContentType),
      course: new FormControl(profileRawValue.course, {
        validators: [Validators.required],
      }),
      courseYear: new FormControl(profileRawValue.courseYear, {
        validators: [Validators.required, Validators.min(1), Validators.max(6)],
      }),
      gymSkill: new FormControl(profileRawValue.gymSkill),
      gymLocation: new FormControl(profileRawValue.gymLocation),
      gymTime: new FormControl(profileRawValue.gymTime),
      studyTime: new FormControl(profileRawValue.studyTime),
      sports: new FormControl(profileRawValue.sports),
      sportsSkill: new FormControl(profileRawValue.sportsSkill),
      user: new FormControl<IUser | null | undefined>(profileRawValue.user),
    });
  }

  getProfile(form: ProfileFormGroup): IProfile | NewProfile {
    // Returns the raw values from the form (including null if present).
    return form.getRawValue() as IProfile | NewProfile;
  }

  resetForm(form: ProfileFormGroup, profile: ProfileFormGroupInput): void {
    const profileRawValue = { ...this.getFormDefaults(), ...profile };
    form.reset(
      {
        ...profileRawValue,
        id: { value: profileRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): ProfileFormDefaults {
    return {
      id: null,
    };
  }
}
