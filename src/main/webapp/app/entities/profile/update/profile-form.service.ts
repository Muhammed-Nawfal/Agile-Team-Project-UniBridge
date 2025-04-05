import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IProfile, NewProfile } from '../profile.model';
import { IUser } from '../../user/user.model';

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
  id: FormControl<IProfile['id'] | NewProfile['id']>;
  bio: FormControl<IProfile['bio']>;
  profilePicture: FormControl<IProfile['profilePicture']>;
  profilePictureContentType: FormControl<IProfile['profilePictureContentType']>;
  course: FormControl<IProfile['course']>;
  courseYear: FormControl<IProfile['courseYear']>;
  university: FormControl<IProfile['university']>;
  gymSkill: FormControl<IProfile['gymSkill']>;
  gymLocation: FormControl<IProfile['gymLocation']>;
  gymTime: FormControl<IProfile['gymTime']>;
  studyTime: FormControl<IProfile['studyTime']>;
  sports: FormControl<IProfile['sports']>;
  sportsSkill: FormControl<IProfile['sportsSkill']>;
  sportsTime: FormControl<IProfile['sportsTime']>;
  preferredSociety: FormControl<IProfile['preferredSociety']>;
  preferredEvents: FormControl<IProfile['preferredEvents']>;
  eventsTime: FormControl<IProfile['eventsTime']>;
  preferredActivities: FormControl<IProfile['preferredActivities']>;
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
      id: new FormControl(
        { value: profileRawValue.id, disabled: true },
        {
          nonNullable: true,
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
      university: new FormControl(profileRawValue.university, {
        validators: [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
      }),
      gymSkill: new FormControl(profileRawValue.gymSkill),
      gymLocation: new FormControl(profileRawValue.gymLocation),
      gymTime: new FormControl(profileRawValue.gymTime),
      studyTime: new FormControl(profileRawValue.studyTime),
      sports: new FormControl(profileRawValue.sports),
      sportsSkill: new FormControl(profileRawValue.sportsSkill),
      sportsTime: new FormControl(profileRawValue.sportsTime),
      preferredSociety: new FormControl(profileRawValue.preferredSociety),
      preferredEvents: new FormControl(profileRawValue.preferredEvents),
      eventsTime: new FormControl(profileRawValue.eventsTime),
      preferredActivities: new FormControl(profileRawValue.preferredActivities),
      user: new FormControl(profileRawValue.user),
    });
  }

  getProfile(form: ProfileFormGroup): IProfile | NewProfile {
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
