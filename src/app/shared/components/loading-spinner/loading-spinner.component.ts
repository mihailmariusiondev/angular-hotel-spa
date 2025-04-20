import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '@app/core/services/loading.service';

/**
 * Component to display a loading spinner based on the application's loading state.
 */
@Component({
  selector: 'app-shared-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss'],
})
export class LoadingSpinnerComponent {
  // Inject the LoadingService to access the loading state
  private loadingService = inject(LoadingService);

  // Observable stream of the loading state from the LoadingService
  loading$ = this.loadingService.loading$;
}
