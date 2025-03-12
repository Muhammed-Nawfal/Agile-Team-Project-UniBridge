import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IChallenge, NewChallenge } from '../challenge.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IChallenge for edit and NewChallengeFormGroupInput for create.
 */
type ChallengeFormGroupInput = IChallenge | PartialWithRequiredKeyOf<NewChallenge>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IChallenge | NewChallenge> = Omit<T, 'createdDate' | 'expiryDate' | 'completedDate'> & {
  createdDate?: string | null;
  expiryDate?: string | null;
  completedDate?: string | null;
};

type ChallengeFormRawValue = FormValueOf<IChallenge>;

type NewChallengeFormRawValue = FormValueOf<NewChallenge>;

type ChallengeFormDefaults = Pick<NewChallenge, 'id' | 'createdDate' | 'expiryDate' | 'isCompleted' | 'completedDate' | 'isDisplayed'>;

type ChallengeFormGroupContent = {
  id: FormControl<ChallengeFormRawValue['id'] | NewChallenge['id']>;
  title: FormControl<ChallengeFormRawValue['title']>;
  description: FormControl<ChallengeFormRawValue['description']>;
  category: FormControl<ChallengeFormRawValue['category']>;
  points: FormControl<ChallengeFormRawValue['points']>;
  badge: FormControl<ChallengeFormRawValue['badge']>;
  badgeContentType: FormControl<ChallengeFormRawValue['badgeContentType']>;
  createdDate: FormControl<ChallengeFormRawValue['createdDate']>;
  expiryDate: FormControl<ChallengeFormRawValue['expiryDate']>;
  isCompleted: FormControl<ChallengeFormRawValue['isCompleted']>;
  completedDate: FormControl<ChallengeFormRawValue['completedDate']>;
  isDisplayed: FormControl<ChallengeFormRawValue['isDisplayed']>;
  creator: FormControl<ChallengeFormRawValue['creator']>;
  recipient: FormControl<ChallengeFormRawValue['recipient']>;
};

export type ChallengeFormGroup = FormGroup<ChallengeFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ChallengeFormService {
  createChallengeFormGroup(challenge: ChallengeFormGroupInput = { id: null }): ChallengeFormGroup {
    const challengeRawValue = this.convertChallengeToChallengeRawValue({
      ...this.getFormDefaults(),
      ...challenge,
    });
    return new FormGroup<ChallengeFormGroupContent>({
      id: new FormControl(
        { value: challengeRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      title: new FormControl(challengeRawValue.title, {
        validators: [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
      }),
      description: new FormControl(challengeRawValue.description, {
        validators: [Validators.required],
      }),
      category: new FormControl(challengeRawValue.category, {
        validators: [Validators.required],
      }),
      points: new FormControl(challengeRawValue.points, {
        validators: [Validators.required, Validators.min(1), Validators.max(100)],
      }),
      badge: new FormControl(challengeRawValue.badge, {
        validators: [Validators.required],
      }),
      badgeContentType: new FormControl(challengeRawValue.badgeContentType),
      createdDate: new FormControl(challengeRawValue.createdDate, {
        validators: [Validators.required],
      }),
      expiryDate: new FormControl(challengeRawValue.expiryDate),
      isCompleted: new FormControl(challengeRawValue.isCompleted, {
        validators: [Validators.required],
      }),
      completedDate: new FormControl(challengeRawValue.completedDate),
      isDisplayed: new FormControl(challengeRawValue.isDisplayed),
      creator: new FormControl(challengeRawValue.creator),
      recipient: new FormControl(challengeRawValue.recipient),
    });
  }

  getChallenge(form: ChallengeFormGroup): IChallenge | NewChallenge {
    return this.convertChallengeRawValueToChallenge(form.getRawValue() as ChallengeFormRawValue | NewChallengeFormRawValue);
  }

  resetForm(form: ChallengeFormGroup, challenge: ChallengeFormGroupInput): void {
    const challengeRawValue = this.convertChallengeToChallengeRawValue({ ...this.getFormDefaults(), ...challenge });
    form.reset(
      {
        ...challengeRawValue,
        id: { value: challengeRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): ChallengeFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdDate: currentTime,
      expiryDate: currentTime,
      isCompleted: false,
      completedDate: currentTime,
      isDisplayed: false,
    };
  }

  private convertChallengeRawValueToChallenge(rawChallenge: ChallengeFormRawValue | NewChallengeFormRawValue): IChallenge | NewChallenge {
    return {
      ...rawChallenge,
      createdDate: dayjs(rawChallenge.createdDate, DATE_TIME_FORMAT),
      expiryDate: dayjs(rawChallenge.expiryDate, DATE_TIME_FORMAT),
      completedDate: dayjs(rawChallenge.completedDate, DATE_TIME_FORMAT),
    };
  }

  private convertChallengeToChallengeRawValue(
    challenge: IChallenge | (Partial<NewChallenge> & ChallengeFormDefaults),
  ): ChallengeFormRawValue | PartialWithRequiredKeyOf<NewChallengeFormRawValue> {
    return {
      ...challenge,
      createdDate: challenge.createdDate ? challenge.createdDate.format(DATE_TIME_FORMAT) : undefined,
      expiryDate: challenge.expiryDate ? challenge.expiryDate.format(DATE_TIME_FORMAT) : undefined,
      completedDate: challenge.completedDate ? challenge.completedDate.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
