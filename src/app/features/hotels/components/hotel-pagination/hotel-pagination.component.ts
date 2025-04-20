import { Component, inject } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HotelStateService } from '../../services/hotel-state.service';
import { map } from 'rxjs';
import { AVAILABLE_PAGE_SIZES } from '../../models/hotel.model'; // Import available sizes
import { HotelSortComponent } from '../hotel-sort/hotel-sort.component'; // Import HotelSortComponent

/**
 * Component for navigating through pages of hotel results.
 * Displays pagination information and provides controls for changing pages and page size.
 */
@Component({
  selector: 'app-hotel-pagination',
  standalone: true,
  imports: [CommonModule, HotelSortComponent],
  templateUrl: './hotel-pagination.component.html',
  styleUrls: ['./hotel-pagination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelPaginationComponent {
  // Inject the HotelStateService
  private hotelStateService = inject(HotelStateService);

  // Expose available page sizes to the template
  readonly availablePageSizes = AVAILABLE_PAGE_SIZES;

  // Observable stream of the current pagination state
  paginationState$ = this.hotelStateService.paginationState$;

  // --- Derived Properties for the Template ---
  totalPages$ = this.paginationState$.pipe(
    map(state => Math.max(1, Math.ceil(state.totalItems / state.pageSize))) // Ensure totalPages is at least 1
  );

  resultsInfo$ = this.paginationState$.pipe(
    map(state => {
      if (state.totalItems === 0) {
        return { start: 0, end: 0, total: 0 };
      }
      const start = (state.currentPage - 1) * state.pageSize + 1;
      const end = Math.min(start + state.pageSize - 1, state.totalItems);
      return { start, end, total: state.totalItems };
    })
  );

  // --- Page Navigation Methods ---
  goToPage(page: number): void {
    this.hotelStateService.goToPage(page);
  }
  nextPage(): void {
    this.hotelStateService.nextPage();
  }
  previousPage(): void {
    this.hotelStateService.previousPage();
  }
  firstPage(): void {
    this.hotelStateService.firstPage();
  }
  lastPage(): void {
    this.hotelStateService.lastPage();
  }

  // --- Page Size Change Method ---
  /**
   * Handles the change event from the page size selector.
   * @param event The change event from the select element.
   */
  onPageSizeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newSize = Number(selectElement.value);
    if (!isNaN(newSize)) {
      this.hotelStateService.updatePageSize(newSize);
    }
  }
}
