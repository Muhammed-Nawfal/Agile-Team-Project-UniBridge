import { Component, ElementRef, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AlertError } from 'app/shared/alert/alert-error.model';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { IProfile } from 'app/entities/profile/profile.model';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { Category } from 'app/entities/enumerations/category.model';
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
  categoryValues = Object.keys(Category);
  pointValues = [5, 10, 15, 20, 25]; // Updated point values
  currentWordCount = 0;
  maxWordCount = 1000;
  isEditMode = false; // Flag to check if we're editing an existing challenge

  profilesSharedCollection: IProfile[] = [];

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected challengeService = inject(ChallengeService);
  protected challengeFormService = inject(ChallengeFormService);
  protected profileService = inject(ProfileService);
  protected elementRef = inject(ElementRef);
  protected activatedRoute = inject(ActivatedRoute);
  protected router = inject(Router);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: ChallengeFormGroup = this.challengeFormService.createChallengeFormGroup();

  compareProfile = (o1: IProfile | null, o2: IProfile | null): boolean => this.profileService.compareProfile(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ challenge }) => {
      this.challenge = challenge;
      // If challenge has an ID, we're in edit mode
      this.isEditMode = challenge && challenge.id !== null;

      if (challenge) {
        this.updateForm(challenge);
      }

      this.loadRelationshipsOptions();

      // Add a listener to update word count in real time
      this.editForm.get('description')?.valueChanges.subscribe(value => {
        if (value !== undefined) {
          this.updateWordCount(value);
        }
      });

      // If creating a new challenge, set default values
      if (!this.isEditMode) {
        this.setDefaultValues();
      }
    });
  }

  // Set default values for a new challenge
  setDefaultValues(): void {
    // Set current date as default using dayjs
    this.editForm.patchValue({
      date: dayjs(), // Use dayjs for today's date
      completed: false, // Default to not completed
    });
  }

  updateWordCount(text: string | null): void {
    if (!text) {
      this.currentWordCount = 0;
      return;
    }
    this.currentWordCount = text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
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
    // Navigate to the challenge list page instead of just going back
    // This ensures the list is refreshed with the new challenge
    this.router.navigate(['/challenge']);
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

    this.profilesSharedCollection = this.profileService.addProfileToCollectionIfMissing<IProfile>(
      this.profilesSharedCollection,
      challenge.assignedTo,
      challenge.createdBy,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.profileService
      .query()
      .pipe(map((res: HttpResponse<IProfile[]>) => res.body ?? []))
      .pipe(
        map((profiles: IProfile[]) =>
          this.profileService.addProfileToCollectionIfMissing<IProfile>(profiles, this.challenge?.assignedTo, this.challenge?.createdBy),
        ),
      )
      .subscribe((profiles: IProfile[]) => (this.profilesSharedCollection = profiles));
  }
}
