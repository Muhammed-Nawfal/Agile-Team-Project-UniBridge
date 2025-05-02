import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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

type ChallengeFormDefaults = Pick<NewChallenge, 'id' | 'completed'>;

type ChallengeFormGroupContent = {
  id: FormControl<IChallenge['id'] | NewChallenge['id']>;
  title: FormControl<IChallenge['title']>;
  description: FormControl<IChallenge['description']>;
  category: FormControl<IChallenge['category']>;
  date: FormControl<IChallenge['date']>;
  points: FormControl<IChallenge['points']>;
  badge: FormControl<IChallenge['badge']>;
  badgeContentType: FormControl<IChallenge['badgeContentType']>;
  completed: FormControl<IChallenge['completed']>;
  assignedTo: FormControl<IChallenge['assignedTo']>;
  createdBy: FormControl<IChallenge['createdBy']>;
};

export type ChallengeFormGroup = FormGroup<ChallengeFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ChallengeFormService {
  createChallengeFormGroup(challenge: ChallengeFormGroupInput = { id: null }): ChallengeFormGroup {
    const challengeRawValue = {
      ...this.getFormDefaults(),
      ...challenge,
    };
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
      date: new FormControl(challengeRawValue.date, {
        validators: [Validators.required],
      }),
      points: new FormControl(challengeRawValue.points, {
        validators: [Validators.required, Validators.min(1), Validators.max(100)],
      }),
      badge: new FormControl(challengeRawValue.badge, {
        validators: [Validators.required],
      }),
      badgeContentType: new FormControl(challengeRawValue.badgeContentType),
      completed: new FormControl(challengeRawValue.completed, {
        validators: [Validators.required],
      }),
      assignedTo: new FormControl(challengeRawValue.assignedTo),
      createdBy: new FormControl(challengeRawValue.createdBy),
    });
  }

  getChallenge(form: ChallengeFormGroup): IChallenge | NewChallenge {
    return form.getRawValue() as IChallenge | NewChallenge;
  }

  resetForm(form: ChallengeFormGroup, challenge: ChallengeFormGroupInput): void {
    const challengeRawValue = { ...this.getFormDefaults(), ...challenge };
    form.reset(
      {
        ...challengeRawValue,
        id: { value: challengeRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): ChallengeFormDefaults {
    return {
      id: null,
      completed: false,
    };
  }
}
