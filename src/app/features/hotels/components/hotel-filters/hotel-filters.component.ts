import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HotelStateService } from '../../services/hotel-state.service';
import { map } from 'rxjs/operators';
import { FilterState } from '../../models/hotel.model';
import { Subscription } from 'rxjs';

/**
 * Component for filtering hotels based on various criteria.
 * Provides input fields for name, star rating, minimum rate, and maximum price.
 */
@Component({
  selector: 'app-hotel-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './hotel-filters.component.html',
  styleUrls: ['./hotel-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelFiltersComponent implements OnInit, OnDestroy {
  // Inject the HotelStateService to interact with the hotel state
  private hotelStateService = inject(HotelStateService);

  // FormGroup for managing the name, minRate, and maxPrice filter controls
  filterForm = new FormGroup({
    name: new FormControl(''),
    minRate: new FormControl(0),
    maxPrice: new FormControl(1000),
  });

  // Array representing the available star rating options (1 to 5)
  starOptions = [1, 2, 3, 4, 5];
  // Array to hold the currently selected star ratings for filtering
  selectedStars: number[] = [];

  // Valor por defecto idéntico a initialState.filters en el servicio
  public readonly defaultFilters: FilterState = {
    name: '',
    selectedStars: [],
    minRate: 0,
    maxPrice: 1000,
  };

  // Stream of applied filters from server
  filterState$ = this.hotelStateService.filterState$;
  private appliedFilters: FilterState = this.defaultFilters;
  private sub = new Subscription();

  // Deshabilita el botón si el estado actual coincide exactamente con el por defecto
  hasActiveFilters$ = this.hotelStateService.filterState$.pipe(
    map(fs => JSON.stringify(fs) !== JSON.stringify(this.defaultFilters))
  );

  ngOnInit(): void {
    // keep track of what's currently applied (from back)
    this.sub.add(
      this.hotelStateService.filterState$.subscribe(fs => {
        this.appliedFilters = fs;
        // reset form to match applied, clearing any pending edits
        this.filterForm.setValue(
          {
            name: fs.name,
            minRate: fs.minRate,
            maxPrice: fs.maxPrice,
          },
          { emitEvent: false }
        );
        this.selectedStars = [...fs.selectedStars];
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  /** apply current form & star selections to state */
  applyFilters(): void {
    const { name, minRate, maxPrice } = this.filterForm.value;
    this.hotelStateService.updateNameFilter(name || '');
    this.hotelStateService.updateStarsFilter(this.selectedStars);
    this.hotelStateService.updateMinRateFilter(minRate || 0);
    this.hotelStateService.updateMaxPriceFilter(maxPrice || 1000);
  }

  /** detect if form/stars differ from last applied */
  hasPendingChanges(): boolean {
    const cur: FilterState = {
      name: this.filterForm.value.name || '',
      selectedStars: [...this.selectedStars],
      minRate: this.filterForm.value.minRate || 0,
      maxPrice: this.filterForm.value.maxPrice || 1000,
    };
    return JSON.stringify(cur) !== JSON.stringify(this.appliedFilters);
  }

  /**
   * Handles changes to the star rating checkboxes.
   * Updates the selectedStars array and the star filter in the HotelStateService.
   * @param star - The star rating that was changed.
   * @param isChecked - Whether the star rating is now checked.
   */
  onStarFilterChange(star: number, isChecked: boolean): void {
    if (isChecked) {
      this.selectedStars = [...this.selectedStars, star];
    } else {
      this.selectedStars = this.selectedStars.filter(s => s !== star);
    }

    // just update local selection; will send to state on apply
  }

  /**
   * Resets all filters to their initial default values.
   */
  resetFilters(): void {
    // Reset the form controls for name, minRate, and maxPrice
    this.filterForm.reset({
      name: '',
      minRate: 0,
      maxPrice: 1000,
    });

    // Clear the selected stars array
    this.selectedStars = [];
    // Call the reset filters method in the HotelStateService
    this.hotelStateService.resetFilters();
  }

  /**
   * Removes a specific filter based on its type and value (for star filter).
   * Updates the local form/state and triggers a refetch via the state service.
   * @param filterType - The type of filter to remove ('name', 'stars', 'minRate', 'maxPrice').
   * @param value - The value of the filter to remove (used for 'stars' filter).
   */
  removeFilter(filterType: string, value?: number): void {
    switch (filterType) {
      case 'name':
        this.filterForm.get('name')?.setValue('');
        // Add this line:
        this.hotelStateService.updateNameFilter('');
        break;
      case 'stars':
        if (value) {
          this.selectedStars = this.selectedStars.filter(s => s !== value);
          this.hotelStateService.updateStarsFilter(this.selectedStars);
        }
        break;
      case 'minRate':
        this.filterForm.get('minRate')?.setValue(0);
        this.hotelStateService.updateMinRateFilter(0);
        break;
      case 'maxPrice':
        this.filterForm.get('maxPrice')?.setValue(1000);
        this.hotelStateService.updateMaxPriceFilter(1000);
        break;
    }
  }
}
