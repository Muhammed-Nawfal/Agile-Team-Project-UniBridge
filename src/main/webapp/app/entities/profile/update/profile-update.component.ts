import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { ProfileService } from '../service/profile.service';
import { IProfile, NewProfile } from '../profile.model';
import { DataUtils } from 'app/core/util/data-util.service';
import { ProfileFormService } from './profile-form.service';

@Component({
  selector: 'jhi-profile-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './profile-update.component.html',
  styleUrls: ['./profile-update.component.scss'],
})
export class ProfileUpdateComponent implements OnInit {
  isSaving = false;
  profile: IProfile | null = null;

  // enumerations
  courseValues = ['COMPUTER_SCIENCE', 'ECONOMICS', 'PSYCHOLOGY', 'MATHS', 'ENGLISH', 'ENGINEERING'];
  skillValues = ['NOVICE', 'INTERMEDIATE', 'CONFIDENT', 'PROFESSIONAL'];
  gymLocationValues = ['THE_GYM_SELLY_OAK', 'TIVERTON', 'PUREGYM_FIVE_WAYS'];
  preferredTimeValues = ['EARLY', 'MORNING', 'AFTERNOON', 'EVENING', 'NIGHT', 'LATE'];
  sportsValues = ['FOOTBALL', 'CRICKET', 'BADMINTON', 'TENNIS', 'NETBALL'];

  // Use the ProfileFormService to create the form
  editForm = this.profileFormService.createProfileFormGroup();
  showUpdateTip = true;

  constructor(
    protected profileService: ProfileService,
    protected profileFormService: ProfileFormService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder,
    protected dataUtils: DataUtils,
  ) {}

  ngOnInit(): void {
    // Handle one-time tip for the current session
    const tipDismissed = sessionStorage.getItem('updateProfileTipDismissed');
    this.showUpdateTip = !tipDismissed;

    this.activatedRoute.data.subscribe(({ profile }) => {
      if (profile?.id) {
        this.profile = profile;
        this.profileFormService.resetForm(this.editForm, profile);
      } else {
        this.previousState();
      }
    });
  }

  dismissUpdateTip(): void {
    this.showUpdateTip = false;
    sessionStorage.setItem('updateProfileTipDismissed', 'true');
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.dataUtils.loadFileToForm(event, this.editForm, field, isImage).subscribe();
  }

  // Fix for line 65
  clearInputImage(field: string, fieldContentType: string, idInput: string): void {
    this.editForm.patchValue({
      [field]: null,
      [fieldContentType]: null,
    });
    const input = document.getElementById(idInput);
    if (input instanceof HTMLInputElement) {
      input.value = '';
    }
  }

  save(): void {
    this.isSaving = true;
    const profileData = this.profileFormService.getProfile(this.editForm);

    // Only proceed if we have a numeric ID (meaning it's an existing profile)
    if (typeof profileData.id === 'number') {
      const profile: IProfile = {
        ...profileData,
        id: profileData.id,
      };

      this.profileService.update(profile).subscribe({
        next: () => this.onSaveSuccess(),
        error: () => this.onSaveError(),
      });
    } else {
      // Handle case where there's no valid ID
      this.onSaveError();
      console.error('Cannot save profile without a valid ID');
    }
  }

  previousState(): void {
    window.history.back();
  }

  protected onSaveSuccess(): void {
    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError(): void {
    this.isSaving = false;
  }
}
