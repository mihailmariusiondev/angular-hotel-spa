import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HotelCardComponent } from '../../components/hotel-card/hotel-card.component';
import { HotelFiltersComponent } from '../../components/hotel-filters/hotel-filters.component';
import { HotelPaginationComponent } from '../../components/hotel-pagination/hotel-pagination.component';
import { LoadingSpinnerComponent } from '@app/shared/components/loading-spinner/loading-spinner.component';
import { LoadingService } from '@app/core/services/loading.service';
import { HotelStateService } from '../../services/hotel-state.service';
import { Observable, map, combineLatest } from 'rxjs';
import { Hotel, FilterState } from '../../models/hotel.model';
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-hotels-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    HotelCardComponent,
    HotelFiltersComponent,
    HotelPaginationComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './hotel-list.component.html',
  styleUrls: ['./hotel-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelsListComponent implements OnInit {
  private hotelStateService = inject(HotelStateService);
  private loadingService = inject(LoadingService);

  hotels$: Observable<Hotel[]> = this.hotelStateService.paginatedHotels$;

  // --- Logic to Determine if "No Results" Message Should Show ---
  // The "no results" message should be shown if:
  // 1. The application is not currently loading data.
  // 2. The current page's hotels array is empty.
  // 3. There are active filters applied (or a search term entered).

  // Observable to check if any filters are currently active
  private hasActiveFilters$ = this.hotelStateService.filterState$.pipe(
    map(
      (filters: FilterState) =>
        filters.name !== '' ||
        filters.selectedStars.length > 0 ||
        filters.minRate > 0 ||
        filters.maxPrice < 1000
    )
  );

  private loading$ = this.loadingService.loading$;

  // Observable that determines whether the "no results" message should be displayed
  hasNoResults$ = combineLatest([
    this.hotels$, // The current list of hotels
    this.hasActiveFilters$, // Whether filters are active
    this.loading$, // The current loading state
  ]).pipe(
    map(([hotels, hasActiveFilters, isLoading]) => {
      // Show "no results" only when not loading, hotels array is empty, AND filters are active
      return !isLoading && hotels.length === 0 && hasActiveFilters;
    })
  );
  // --- End No Results Logic ---

  ngOnInit(): void {
    // Fetch the initial data when the component is initialized
    this.hotelStateService.initializeData();
  }

  /**
   * Track function for ngFor to improve performance when rendering the list of hotels.
   * Helps Angular identify which items have changed, been added, or been removed.
   * @param _index - The index of the item in the array.
   * @param hotel - The hotel object.
   * @returns The unique ID of the hotel.
   */
  trackByHotelId(_index: number, hotel: Hotel): string {
    return hotel.id;
  }
}
