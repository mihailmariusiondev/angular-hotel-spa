import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelStateService } from '../../services/hotel-state.service';

/**
 * Component for sorting hotel results using a dropdown.
 * Allows sorting by price, rate, stars, or name in ascending or descending order.
 */
@Component({
  selector: 'app-hotel-sort',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hotel-sort.component.html',
  styleUrls: ['./hotel-sort.component.scss'],
})
export class HotelSortComponent {
  // Inject the HotelStateService to interact with the hotel state and sort methods
  private hotelStateService = inject(HotelStateService);

  // Array of available sorting options for the dropdown
  sortOptions = [
    { value: 'price,asc', label: 'Precio (menor a mayor)' },
    { value: 'price,desc', label: 'Precio (mayor a menor)' },
    { value: 'rate,desc', label: 'Valoración (mayor a menor)' },
    { value: 'rate,asc', label: 'Valoración (menor a mayor)' },
    { value: 'stars,desc', label: 'Estrellas (mayor a menor)' },
    { value: 'stars,asc', label: 'Estrellas (menor a mayor)' },
    { value: 'name,asc', label: 'Nombre (A-Z)' },
    { value: 'name,desc', label: 'Nombre (Z-A)' },
  ];

  // Property to hold the currently selected sort option from the dropdown
  selectedSort = '';

  // Observable stream of the current sort state from the HotelStateService
  sortState$ = this.hotelStateService.sortState$;

  /**
   * Handles the change event of the sort dropdown.
   * Parses the selected value and updates the sort state in the HotelStateService.
   */
  onSortChange(): void {
    // If no option is selected, reset the sort state
    if (!this.selectedSort) {
      this.hotelStateService.updateSort(null, 'asc');
      return;
    }

    // Split the selected value into sortBy and sortDirection
    const [sortBy, sortDirection] = this.selectedSort.split(',');
    // Update the sort state in the HotelStateService
    this.hotelStateService.updateSort(
      sortBy as 'price' | 'rate' | 'stars' | 'name',
      sortDirection as 'asc' | 'desc'
    );
  }
}
