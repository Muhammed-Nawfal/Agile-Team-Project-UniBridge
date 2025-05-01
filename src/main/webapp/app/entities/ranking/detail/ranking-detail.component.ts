import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { DurationPipe, FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
import { IRanking } from '../ranking.model';

@Component({
  standalone: true,
  selector: 'jhi-ranking-detail',
  templateUrl: './ranking-detail.component.html',
  imports: [SharedModule, RouterModule, DurationPipe, FormatMediumDatetimePipe, FormatMediumDatePipe],
})
export class RankingDetailComponent {
  ranking = input<IRanking | null>(null);

  previousState(): void {
    window.history.back();
  }
}
