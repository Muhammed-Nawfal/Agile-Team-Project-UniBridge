import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IRanking, NewRanking } from '../ranking.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IRanking for edit and NewRankingFormGroupInput for create.
 */
type RankingFormGroupInput = IRanking | PartialWithRequiredKeyOf<NewRanking>;

type RankingFormDefaults = Pick<NewRanking, 'id'>;

type RankingFormGroupContent = {
  id: FormControl<IRanking['id'] | NewRanking['id']>;
  reviewNumber: FormControl<IRanking['reviewNumber']>;
  activityNumber: FormControl<IRanking['activityNumber']>;
  starAverage: FormControl<IRanking['starAverage']>;
  reliable: FormControl<IRanking['reliable']>;
  rankGiven: FormControl<IRanking['rankGiven']>;
  user: FormControl<IRanking['user']>;
};

export type RankingFormGroup = FormGroup<RankingFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class RankingFormService {
  createRankingFormGroup(ranking: RankingFormGroupInput = { id: null }): RankingFormGroup {
    const rankingRawValue = {
      ...this.getFormDefaults(),
      ...ranking,
    };
    return new FormGroup<RankingFormGroupContent>({
      id: new FormControl(
        { value: rankingRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      reviewNumber: new FormControl(rankingRawValue.reviewNumber, {
        validators: [Validators.required],
      }),
      activityNumber: new FormControl(rankingRawValue.activityNumber, {
        validators: [Validators.required],
      }),
      starAverage: new FormControl(rankingRawValue.starAverage, {
        validators: [Validators.required, Validators.min(0), Validators.max(5)],
      }),
      reliable: new FormControl(rankingRawValue.reliable, {
        validators: [Validators.required],
      }),
      rankGiven: new FormControl(rankingRawValue.rankGiven),
      user: new FormControl(rankingRawValue.user),
    });
  }

  getRanking(form: RankingFormGroup): IRanking | NewRanking {
    return form.getRawValue() as IRanking | NewRanking;
  }

  resetForm(form: RankingFormGroup, ranking: RankingFormGroupInput): void {
    const rankingRawValue = { ...this.getFormDefaults(), ...ranking };
    form.reset(
      {
        ...rankingRawValue,
        id: { value: rankingRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): RankingFormDefaults {
    return {
      id: null,
    };
  }
}
