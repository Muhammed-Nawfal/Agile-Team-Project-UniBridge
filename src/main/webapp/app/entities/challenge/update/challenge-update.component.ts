import { Component, ElementRef, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AlertError } from 'app/shared/alert/alert-error.model';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { AchievementCategory } from 'app/entities/enumerations/achievement-category.model';
import { ChallengeService } from '../service/challenge.service';
import { IChallenge } from '../challenge.model';
import { ChallengeFormGroup, ChallengeFormService } from './challenge-form.service';

@Component({
  standalone: true,
  selector: 'jhi-challenge-update',
  templateUrl: './challenge-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class ChallengeUpdateComponent implements OnInit {
  isSaving = false;
  challenge: IChallenge | null = null;
  achievementCategoryValues = Object.keys(AchievementCategory);

  usersSharedCollection: IUser[] = [];

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected challengeService = inject(ChallengeService);
  protected challengeFormService = inject(ChallengeFormService);
  protected userService = inject(UserService);
  protected elementRef = inject(ElementRef);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: ChallengeFormGroup = this.challengeFormService.createChallengeFormGroup();

  compareUser = (o1: IUser | null, o2: IUser | null): boolean => this.userService.compareUser(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ challenge }) => {
      this.challenge = challenge;
      if (challenge) {
        this.updateForm(challenge);
      }

      this.loadRelationshipsOptions();
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.dataUtils.loadFileToForm(event, this.editForm, field, isImage).subscribe({
      error: (err: FileLoadError) =>
        this.eventManager.broadcast(new EventWithContent<AlertError>('teamproject24App.error', { message: err.message })),
    });
  }

  clearInputImage(field: string, fieldContentType: string, idInput: string): void {
    this.editForm.patchValue({
      [field]: null,
      [fieldContentType]: null,
    });
    if (idInput && this.elementRef.nativeElement.querySelector(`#${idInput}`)) {
      this.elementRef.nativeElement.querySelector(`#${idInput}`).value = null;
    }
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const challenge = this.challengeFormService.getChallenge(this.editForm);
    if (challenge.id !== null) {
      this.subscribeToSaveResponse(this.challengeService.update(challenge));
    } else {
      this.subscribeToSaveResponse(this.challengeService.create(challenge));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IChallenge>>): void {
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

  protected updateForm(challenge: IChallenge): void {
    this.challenge = challenge;
    this.challengeFormService.resetForm(this.editForm, challenge);

    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing<IUser>(
      this.usersSharedCollection,
      challenge.creator,
      challenge.recipient,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(
        map((users: IUser[]) =>
          this.userService.addUserToCollectionIfMissing<IUser>(users, this.challenge?.creator, this.challenge?.recipient),
        ),
      )
      .subscribe((users: IUser[]) => (this.usersSharedCollection = users));
  }
}
