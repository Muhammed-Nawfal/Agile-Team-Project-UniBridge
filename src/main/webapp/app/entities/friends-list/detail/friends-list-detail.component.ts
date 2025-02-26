import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { DurationPipe, FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
import { IFriendsList } from '../friends-list.model';

@Component({
  standalone: true,
  selector: 'jhi-friends-list-detail',
  templateUrl: './friends-list-detail.component.html',
  imports: [SharedModule, RouterModule, DurationPipe, FormatMediumDatetimePipe, FormatMediumDatePipe],
})
export class FriendsListDetailComponent {
  friendsList = input<IFriendsList | null>(null);

  previousState(): void {
    window.history.back();
  }
}
