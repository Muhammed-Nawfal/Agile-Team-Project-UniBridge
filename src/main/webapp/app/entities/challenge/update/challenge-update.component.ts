//  challenge-update.component.ts
import { Component, ElementRef, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import dayjs from 'dayjs/esm';
import { AbstractControl } from '@angular/forms';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';

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
import { ChallengeFormGroup, ChallengeFormService, ChallengeFormGroupInput } from './challenge-form.service';
import { FriendsListService } from 'app/entities/friends-list/service/friends-list.service';

@Component({
  standalone: true,
  selector: 'jhi-challenge-update',
  templateUrl: './challenge-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule, NgbDatepickerModule],
})
export class ChallengeUpdateComponent implements OnInit {
  public isSaving = false;
  public challenge: IChallenge | null = null;
  public categoryValues = Object.keys(Category);
  public pointValues = [5, 10, 15, 20, 25]; // Updated point values
  public currentWordCount = 0;
  public maxWordCount = 1000;
  public isEditMode = false; // Flag to check if we're editing an existing challenge
  public profilesSharedCollection: IProfile[] = [];

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected challengeService = inject(ChallengeService);
  protected challengeFormService = inject(ChallengeFormService);
  protected profileService = inject(ProfileService);
  protected friendsListService = inject(FriendsListService);
  protected elementRef = inject(ElementRef);
  protected activatedRoute = inject(ActivatedRoute);
  protected router = inject(Router);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public editForm: ChallengeFormGroup = this.challengeFormService.createChallengeFormGroup();

  public compareProfile = (o1: IProfile | null, o2: IProfile | null): boolean => this.profileService.compareProfile(o1, o2);

  public createFormWithCurrentUser(challenge: ChallengeFormGroupInput = { id: null }): void {
    this.profileService.findMyProfile().subscribe(profileRes => {
      const myProfile = profileRes.body;

      if (!myProfile) return;

      const updatedChallenge: ChallengeFormGroupInput = {
        ...challenge,
        createdBy: myProfile,
      };

      this.editForm = this.challengeFormService.createChallengeFormGroup(updatedChallenge);
    });
  }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ challenge }) => {
      this.challenge = challenge;
      this.isEditMode = !!challenge?.id;

      if (this.isEditMode && challenge) {
        this.updateForm(challenge); // editing existing challenge
      } else {
        this.createFormWithCurrentUser(); // creating new challenge
        this.setDefaultValues(); // optional: pre-fill fields like default points, date, etc.
      }

      this.loadRelationshipsOptions();

      // Add a listener to update word count in real time
      this.editForm.get('description')?.valueChanges.subscribe(value => {
        if (value !== undefined) {
          this.updateWordCount(value);
        }
      });
    });
  }

  // Set default values for a new challenge
  public setDefaultValues(): void {
    // Set current date as default using dayjs
    this.editForm.patchValue({
      completed: false, // Default to not completed
    });
  }

  public updateWordCount(text: string | null): void {
    if (!text) {
      this.currentWordCount = 0;
      return;
    }
    this.currentWordCount = text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
  }

  public byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  public openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  public setFileData(event: Event, field: string, isImage: boolean): void {
    this.dataUtils.loadFileToForm(event, this.editForm, field, isImage).subscribe({
      error: (err: FileLoadError) =>
        this.eventManager.broadcast(new EventWithContent<AlertError>('teamproject24App.error', { message: err.message })),
    });
  }

  public clearInputImage(field: string, fieldContentType: string, idInput: string): void {
    this.editForm.patchValue({
      [field]: null,
      [fieldContentType]: null,
    });
    // Fix the selector to use template literals
    if (this.elementRef.nativeElement.querySelector(`#${idInput}`)) {
      this.elementRef.nativeElement.querySelector(`#${idInput}`).value = null;
    }
  }

  public previousState(): void {
    window.history.back();
  }

  public trackById(index: number, item: IProfile): number {
    return item.id;
  }

  public save(): void {
    this.isSaving = true;
    const challenge = this.challengeFormService.getChallenge(this.editForm);

    // Always override badge with default image
    challenge.badge = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2NkYGD4DwABBAEAffIabQAAAABJRU5ErkJggg=='; // tiny transparent PNG
    challenge.badgeContentType = 'image/png';

    if (challenge.id !== null) {
      this.subscribeToSaveResponse(this.challengeService.update(challenge));
    } else {
      this.subscribeToSaveResponse(this.challengeService.create(challenge));
    }
  }

  public get dateControl(): AbstractControl | null {
    return this.editForm.get('date');
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
    this.friendsListService.getFollowedProfiles().subscribe(response => {
      const followedIds = (response.body ?? []).map(f => f.id);
      const challengeProfiles = [this.challenge?.assignedTo, this.challenge?.createdBy].filter(p => !!p);
      const challengeProfileIds = challengeProfiles.map(p => p.id);

      const allIds = Array.from(new Set([...followedIds, ...challengeProfileIds]));

      const profileRequests = allIds.map(id => this.profileService.find(id));

      Promise.all(profileRequests.map(req => firstValueFrom(req))).then(profileResponses => {
        const profiles = profileResponses.map(res => res.body).filter(p => p !== null);

        this.profilesSharedCollection = profiles;
      });
    });
  }
}
