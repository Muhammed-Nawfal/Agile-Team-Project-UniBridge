//    challenge-form.ts
import { Injectable, inject } from '@angular/core';

import { FormControl, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ProfileService } from 'app/entities/profile/service/profile.service';
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

type ChallengeFormDefaults = Pick<NewChallenge, 'id' | 'completed' | 'date'>;

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
export type { ChallengeFormGroupInput };

@Injectable({ providedIn: 'root' })
export class ChallengeFormService {
  protected profileService = inject(ProfileService);
  // Custom validator to check minimum word count
  minWordCount(minCount: number): (control: AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Let required validator handle empty values
      }

      const wordCount = control.value
        .trim()
        .split(/\s+/)
        .filter((word: string) => word.length > 0).length;
      return wordCount < minCount ? { minWordCount: { required: minCount, actual: wordCount } } : null;
    };
  }

  // Custom validator to check maximum word count
  maxWordCount(maxCount: number): (control: AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const wordCount = control.value
        .trim()
        .split(/\s+/)
        .filter((word: string) => word.length > 0).length;

      if (wordCount > maxCount) {
        return { maxWordCount: { required: maxCount, actual: wordCount } };
      }

      return null;
    };
  }

  // Custom validator to check if points value is in allowed values
  allowedPointValues(allowedValues: number[]): (control: AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Let required validator handle empty values
      }

      return allowedValues.includes(control.value) ? null : { allowedPointValues: { allowedValues, actual: control.value } };
    };
  }

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
        validators: [Validators.required],
      }),
      description: new FormControl(challengeRawValue.description, {
        validators: [Validators.required, this.maxWordCount(1000)],
      }),
      category: new FormControl(challengeRawValue.category, {
        validators: [Validators.required],
      }),
      date: new FormControl(challengeRawValue.date, {
        validators: [Validators.required],
      }),
      points: new FormControl(challengeRawValue.points, {
        validators: [Validators.required],
      }),
      badge: new FormControl(challengeRawValue.badge, {}),
      badgeContentType: new FormControl(challengeRawValue.badgeContentType),
      completed: new FormControl(challengeRawValue.completed, {
        validators: [Validators.required],
      }),
      assignedTo: new FormControl(challengeRawValue.assignedTo, {
        validators: [Validators.required], // Add required validator here
      }),
      createdBy: new FormControl(challengeRawValue.createdBy),
    });
  }

  getChallenge(form: ChallengeFormGroup): IChallenge | NewChallenge {
    return form.getRawValue();
  }

  resetForm(form: ChallengeFormGroup, challenge: ChallengeFormGroupInput): void {
    const challengeRawValue = { ...this.getFormDefaults(), ...challenge };
    form.reset(
      {
        ...challengeRawValue,
        id: { value: challengeRawValue.id, disabled: true } as any, // workaround type mismatch
      } /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): ChallengeFormDefaults {
    return {
      id: null,
      completed: false,
      date: null,
    };
  }
}
