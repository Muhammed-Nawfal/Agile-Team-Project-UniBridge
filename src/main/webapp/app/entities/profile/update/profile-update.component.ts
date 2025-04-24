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
import { IMessageThread } from 'app/entities/message-thread/message-thread.model';
import { MessageThreadService } from 'app/entities/message-thread/service/message-thread.service';
import { Course } from 'app/entities/enumerations/course.model';
import { University } from 'app/entities/enumerations/university.model';
import { Skill } from 'app/entities/enumerations/skill.model';
import { GymLocation } from 'app/entities/enumerations/gym-location.model';
import { PreferredTime } from 'app/entities/enumerations/preferred-time.model';
import { Sports } from 'app/entities/enumerations/sports.model';
import { Society } from 'app/entities/enumerations/society.model';
import { PreferredEvents } from 'app/entities/enumerations/preferred-events.model';
import { ActivityType } from 'app/entities/enumerations/activity-type.model';
import { ProfileService } from '../service/profile.service';
import { IProfile } from '../profile.model';
import { ProfileFormGroup, ProfileFormService } from './profile-form.service';

@Component({
  standalone: true,
  selector: 'jhi-profile-update',
  templateUrl: './profile-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class ProfileUpdateComponent implements OnInit {
  isSaving = false;
  profile: IProfile | null = null;
  courseValues = Object.keys(Course);
  universityValues = Object.keys(University);
  skillValues = Object.keys(Skill);
  gymLocationValues = Object.keys(GymLocation);
  preferredTimeValues = Object.keys(PreferredTime);
  sportsValues = Object.keys(Sports);
  societyValues = Object.keys(Society);
  preferredEventsValues = Object.keys(PreferredEvents);
  activityTypeValues = Object.keys(ActivityType);

  usersSharedCollection: IUser[] = [];
  messageThreadsSharedCollection: IMessageThread[] = [];

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected profileService = inject(ProfileService);
  protected profileFormService = inject(ProfileFormService);
  protected userService = inject(UserService);
  protected messageThreadService = inject(MessageThreadService);
  protected elementRef = inject(ElementRef);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: ProfileFormGroup = this.profileFormService.createProfileFormGroup();

  compareUser = (o1: IUser | null, o2: IUser | null): boolean => this.userService.compareUser(o1, o2);

  compareMessageThread = (o1: IMessageThread | null, o2: IMessageThread | null): boolean =>
    this.messageThreadService.compareMessageThread(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ profile }) => {
      this.profile = profile;
      if (profile) {
        this.updateForm(profile);
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
    const profile = this.profileFormService.getProfile(this.editForm);
    if (profile.id !== null) {
      this.subscribeToSaveResponse(this.profileService.update(profile));
    } else {
      this.subscribeToSaveResponse(this.profileService.create(profile));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IProfile>>): void {
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

  protected updateForm(profile: IProfile): void {
    this.profile = profile;
    this.profileFormService.resetForm(this.editForm, profile);

    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing<IUser>(this.usersSharedCollection, profile.user);
    this.messageThreadsSharedCollection = this.messageThreadService.addMessageThreadToCollectionIfMissing<IMessageThread>(
      this.messageThreadsSharedCollection,
      ...(profile.messageThreads ?? []),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(map((users: IUser[]) => this.userService.addUserToCollectionIfMissing<IUser>(users, this.profile?.user)))
      .subscribe((users: IUser[]) => (this.usersSharedCollection = users));

    this.messageThreadService
      .query()
      .pipe(map((res: HttpResponse<IMessageThread[]>) => res.body ?? []))
      .pipe(
        map((messageThreads: IMessageThread[]) =>
          this.messageThreadService.addMessageThreadToCollectionIfMissing<IMessageThread>(
            messageThreads,
            ...(this.profile?.messageThreads ?? []),
          ),
        ),
      )
      .subscribe((messageThreads: IMessageThread[]) => (this.messageThreadsSharedCollection = messageThreads));
  }
}
