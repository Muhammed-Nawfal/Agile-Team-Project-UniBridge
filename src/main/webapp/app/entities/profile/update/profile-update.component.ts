import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { FormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { IProfile, NewProfile } from '../profile.model';
import { ProfileFormService, ProfileFormGroup } from './profile-form.service';
import { ProfileService } from '../service/profile.service';
import { DataUtils } from 'app/core/util/data-util.service';

import { Course } from 'app/entities/enumerations/course.model';
import { University } from 'app/entities/enumerations/university.model';
import { Skill } from 'app/entities/enumerations/skill.model';
import { GymLocation } from 'app/entities/enumerations/gym-location.model';
import { PreferredTime } from 'app/entities/enumerations/preferred-time.model';
import { Sports } from 'app/entities/enumerations/sports.model';
import { Society } from 'app/entities/enumerations/society.model';
import { PreferredEvents } from 'app/entities/enumerations/preferred-events.model';
import { ActivityType } from 'app/entities/enumerations/activity-type.model';

import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCalendarAlt, faClock, faMapMarkerAlt, faArrowLeft, faSave, faUserEdit } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'jhi-profile-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, FontAwesomeModule],
  templateUrl: './profile-update.component.html',
  styleUrls: ['./profile-update.component.scss'],
})
export class ProfileUpdateComponent implements OnInit {
  isSaving = false;
  profile: IProfile | null = null;
  showUpdateTip = true;
  editForm = this.profileFormService.createProfileFormGroup();
  // enumerations
  courseValues = Object.keys(Course);
  universityValues = Object.keys(University);
  skillValues = Object.keys(Skill);
  gymLocationValues = Object.keys(GymLocation);
  preferredTimeValues = Object.keys(PreferredTime);
  sportsValues = Object.keys(Sports);
  societyValues = Object.keys(Society);
  preferredEventsValues = Object.keys(PreferredEvents);
  activityTypeValues = Object.keys(ActivityType);

  // Keep a reference to the user field so it can be re-attached on save
  private originalUser: IProfile['user'] | null | undefined = null;

  constructor(
    protected profileService: ProfileService,
    protected profileFormService: ProfileFormService,
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    protected fb: FormBuilder,
    protected dataUtils: DataUtils,
    private library: FaIconLibrary,
  ) {
    this.library.addIcons(faCalendarAlt, faClock, faMapMarkerAlt, faArrowLeft, faSave, faUserEdit);
  }

  ngOnInit(): void {
    // Handle one-time tip for the current session
    const tipDismissed = sessionStorage.getItem('updateProfileTipDismissed');
    this.showUpdateTip = !tipDismissed;

    this.activatedRoute.data.subscribe(({ profile }) => {
      this.profile = profile;
      this.originalUser = profile.user; // Preserve user
      this.updateForm(profile);
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const profile = this.profileFormService.getProfile(this.editForm);
    profile.user = this.originalUser; // Reattach user before saving

    if (profile.id !== null) {
      this.profileService
        .update(profile)
        .pipe(finalize(() => (this.isSaving = false)))
        .subscribe({
          next: () => this.onSaveSuccess(),
          error: () => this.onSaveError(),
        });
    } else {
      this.profileService
        .create(profile)
        .pipe(finalize(() => (this.isSaving = false)))
        .subscribe({
          next: () => this.onSaveSuccess(),
          error: () => this.onSaveError(),
        });
    }
  }

  clearInputImage(field: string, contentTypeField: string, inputId: string): void {
    this.editForm.patchValue({
      [field]: null,
      [contentTypeField]: null,
    });
    const input = document.getElementById(inputId) as HTMLInputElement;
    input.value = '';
  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files?.length) {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const base64Data = (e.target?.result as string).split(',')[1];
        this.editForm.patchValue({
          [field]: base64Data,
          [`${field}ContentType`]: file.type,
        });
      };
      reader.readAsDataURL(file);
    }
  }

  checkEditTip(): void {
    const tipDismissed = localStorage.getItem('profileEditTipDismissed');
    this.showUpdateTip = !tipDismissed;
  }

  dismissUpdateTip(): void {
    this.showUpdateTip = false;
  }

  protected onSaveSuccess(): void {
    this.router.navigate(['/profile']);
  }

  protected onSaveError(): void {
    // Optionally display an error alert here
  }

  protected updateForm(profile: IProfile): void {
    this.editForm = this.profileFormService.createProfileFormGroup(profile);
  }
}
