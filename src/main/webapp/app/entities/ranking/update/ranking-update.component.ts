import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { Reliability } from 'app/entities/enumerations/reliability.model';
import { RankingService } from '../service/ranking.service';
import { IRanking } from '../ranking.model';
import { RankingFormGroup, RankingFormService } from './ranking-form.service';

@Component({
  standalone: true,
  selector: 'jhi-ranking-update',
  templateUrl: './ranking-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class RankingUpdateComponent implements OnInit {
  isSaving = false;
  ranking: IRanking | null = null;
  reliabilityValues = Object.keys(Reliability);

  usersSharedCollection: IUser[] = [];

  protected rankingService = inject(RankingService);
  protected rankingFormService = inject(RankingFormService);
  protected userService = inject(UserService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: RankingFormGroup = this.rankingFormService.createRankingFormGroup();

  compareUser = (o1: IUser | null, o2: IUser | null): boolean => this.userService.compareUser(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ ranking }) => {
      this.ranking = ranking;
      if (ranking) {
        this.updateForm(ranking);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const ranking = this.rankingFormService.getRanking(this.editForm);
    if (ranking.id !== null) {
      this.subscribeToSaveResponse(this.rankingService.update(ranking));
    } else {
      this.subscribeToSaveResponse(this.rankingService.create(ranking));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IRanking>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(ranking: IRanking): void {
    this.ranking = ranking;
    this.rankingFormService.resetForm(this.editForm, ranking);

    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing<IUser>(this.usersSharedCollection, ranking.user);
  }

  protected loadRelationshipsOptions(): void {
    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(map((users: IUser[]) => this.userService.addUserToCollectionIfMissing<IUser>(users, this.ranking?.user)))
      .subscribe((users: IUser[]) => (this.usersSharedCollection = users));
  }
}
