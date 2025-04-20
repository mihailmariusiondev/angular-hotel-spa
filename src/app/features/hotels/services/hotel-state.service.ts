import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  map,
  distinctUntilChanged,
  tap,
  finalize,
  catchError,
  of,
} from 'rxjs';
import {
  Hotel,
  FilterState,
  HotelsState,
  PaginationState,
  SortState,
  GetHotelsOptions,
  AVAILABLE_PAGE_SIZES, // Import the constant
} from '../models/hotel.model';
import { HotelsService } from './hotels.service';
import { LoadingService } from '../../../core/services/loading.service';

/**
 * Service to manage the state of the hotels feature.
 * It holds the current filter, sort, and pagination state, fetches data
 * from the HotelsService, and updates the state accordingly.
 */
@Injectable({ providedIn: 'root' })
export class HotelStateService {
  private readonly hotelsService = inject(HotelsService);
  private readonly loadingService = inject(LoadingService);

  // Use the first available page size as the default
  private readonly initialPageSize = AVAILABLE_PAGE_SIZES[0];

  // Initial state with the client-defined page size
  private readonly initialState: HotelsState = {
    data: [],
    filters: { name: '', selectedStars: [], minRate: 0, maxPrice: 1000 },
    sort: { sortBy: null, sortDirection: 'asc' },
    pagination: { currentPage: 1, pageSize: this.initialPageSize, totalItems: 0 }, // Use initialPageSize
  };

  // BehaviorSubject to hold and emit the current state
  private readonly stateSubject = new BehaviorSubject<HotelsState>(this.initialState);
  // Observable stream of the state
  readonly state$ = this.stateSubject.asObservable();

  // --- Selectors ---
  // Observables derived from the main state$ observable to provide specific parts of the state
  filterState$: Observable<FilterState> = this.state$.pipe(
    map(s => s.filters),
    distinctUntilChanged() // Emit only when filter state changes
  );
  sortState$: Observable<SortState> = this.state$.pipe(
    map(s => s.sort),
    distinctUntilChanged() // Emit only when sort state changes
  );
  paginationState$: Observable<PaginationState> = this.state$.pipe(
    map(s => s.pagination),
    distinctUntilChanged() // Emit only when pagination state changes
  );
  paginatedHotels$: Observable<Hotel[]> = this.state$.pipe(
    map(s => s.data),
    distinctUntilChanged() // Emit only when hotel data changes
  );

  /**
   * Initializes the data by fetching hotels based on the initial state.
   */
  initializeData(): void {
    this.fetchHotels();
  }

  /**
   * Fetches hotels from the HotelsService based on the current state
   * and updates the state with the received data and pagination info.
   */
  private fetchHotels(): void {
    const currentState = this.stateSubject.getValue();
    // Prepare options for the HotelsService based on the current state
    const options: GetHotelsOptions = {
      filters: currentState.filters,
      sort: currentState.sort,
      pagination: {
        currentPage: currentState.pagination.currentPage,
        pageSize: currentState.pagination.pageSize,
        totalItems: currentState.pagination.totalItems, // This is just for information
      },
    };

    this.loadingService.show(); // Show loading spinner

    this.hotelsService
      .getHotelsWithOptions(options)
      .pipe(
        tap(({ data, totalItems }) => {
          const pageSize = currentState.pagination.pageSize;
          const currentPage = currentState.pagination.currentPage;
          // Recalculate total pages based on potentially updated totalItems and current pageSize
          const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
          // Adjust current page if it's now out of bounds (e.g., after filter/pageSize change)
          const adjustedPage = Math.min(currentPage, totalPages); // Ensure page is within new bounds

          this.patchState({
            data: data,
            pagination: {
              ...currentState.pagination,
              totalItems: totalItems,
              currentPage: adjustedPage, // Use adjusted page
            },
          });
        }),
        catchError(error => {
          console.error('Error fetching hotels:', error);
          // Reset state to initial on error, keeping current filters/sort? Decide based on UX.
          // Here we reset data and pagination only.
          this.patchState({
            data: [],
            pagination: { ...this.initialState.pagination },
          });
          return of(null); // Return a null observable to complete the stream
        }),
        finalize(() => {
          this.loadingService.hide(); // Hide loading spinner
        })
      )
      .subscribe(); // Subscribe to trigger the request
  }

  // --- Mutators (Update state and trigger fetchHotels) ---

  updateNameFilter(name: string): void {
    const currentState = this.stateSubject.getValue();
    if (currentState.filters.name !== name) {
      this.patchState({
        filters: { ...currentState.filters, name },
        pagination: { ...currentState.pagination, currentPage: 1 }, // Reset to first page
      });
      this.fetchHotels();
    }
  }

  updateStarsFilter(selectedStars: number[]): void {
    const currentState = this.stateSubject.getValue();
    if (
      JSON.stringify([...currentState.filters.selectedStars].sort()) !==
      JSON.stringify([...selectedStars].sort())
    ) {
      this.patchState({
        filters: { ...currentState.filters, selectedStars },
        pagination: { ...currentState.pagination, currentPage: 1 }, // Reset to first page
      });
      this.fetchHotels();
    }
  }

  updateMinRateFilter(minRate: number): void {
    const currentState = this.stateSubject.getValue();
    if (currentState.filters.minRate !== minRate) {
      this.patchState({
        filters: { ...currentState.filters, minRate },
        pagination: { ...currentState.pagination, currentPage: 1 }, // Reset to first page
      });
      this.fetchHotels();
    }
  }

  updateMaxPriceFilter(maxPrice: number): void {
    const currentState = this.stateSubject.getValue();
    if (currentState.filters.maxPrice !== maxPrice) {
      this.patchState({
        filters: { ...currentState.filters, maxPrice },
        pagination: { ...currentState.pagination, currentPage: 1 }, // Reset to first page
      });
      this.fetchHotels();
    }
  }

  updateSort(sortBy: SortState['sortBy'], sortDirection: SortState['sortDirection']): void {
    const currentState = this.stateSubject.getValue();
    if (currentState.sort.sortBy !== sortBy || currentState.sort.sortDirection !== sortDirection) {
      this.patchState({
        sort: { sortBy, sortDirection },
        pagination: { ...currentState.pagination, currentPage: 1 }, // Reset to first page
      });
      this.fetchHotels();
    }
  }

  // --- Pagination ---

  updatePageSize(newPageSize: number): void {
    const currentState = this.stateSubject.getValue();
    // Only update if the page size is different and valid
    if (
      AVAILABLE_PAGE_SIZES.includes(newPageSize) &&
      currentState.pagination.pageSize !== newPageSize
    ) {
      this.patchState({
        pagination: {
          ...currentState.pagination,
          pageSize: newPageSize,
          currentPage: 1, // Reset to first page when page size changes
        },
      });
      this.fetchHotels(); // Fetch data with the new page size
    }
  }

  goToPage(page: number): void {
    const currentPagination = this.stateSubject.getValue().pagination;
    const totalPages = Math.max(
      1,
      Math.ceil(currentPagination.totalItems / currentPagination.pageSize)
    );

    if (page >= 1 && page <= totalPages && currentPagination.currentPage !== page) {
      this.patchState({ pagination: { ...currentPagination, currentPage: page } });
      this.fetchHotels();
    }
  }

  nextPage(): void {
    this.goToPage(this.stateSubject.getValue().pagination.currentPage + 1);
  }
  previousPage(): void {
    this.goToPage(this.stateSubject.getValue().pagination.currentPage - 1);
  }
  firstPage(): void {
    if (this.stateSubject.getValue().pagination.currentPage !== 1) {
      this.goToPage(1);
    }
  }
  lastPage(): void {
    const currentPagination = this.stateSubject.getValue().pagination;
    const lastPageNum = Math.max(
      1,
      Math.ceil(currentPagination.totalItems / currentPagination.pageSize)
    );
    if (currentPagination.currentPage !== lastPageNum) {
      this.goToPage(lastPageNum);
    }
  }

  // --- Reset ---

  resetFilters(): void {
    const currentState = this.stateSubject.getValue();
    const filtersAreDefault =
      JSON.stringify(currentState.filters) === JSON.stringify(this.initialState.filters);

    if (!filtersAreDefault) {
      this.patchState({
        filters: { ...this.initialState.filters },
        pagination: { ...currentState.pagination, currentPage: 1 }, // Reset to first page
      });
      this.fetchHotels();
    } else if (currentState.pagination.currentPage !== 1) {
      // If filters were already default, but not on page 1, go to page 1
      this.firstPage();
    }
  }

  // --- Helper Method ---
  private patchState(partial: Partial<HotelsState>): void {
    const newState = { ...this.stateSubject.getValue(), ...partial };
    this.stateSubject.next(newState);
  }
}
