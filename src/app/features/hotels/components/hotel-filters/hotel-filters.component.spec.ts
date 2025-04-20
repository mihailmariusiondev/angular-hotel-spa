import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HotelFiltersComponent } from './hotel-filters.component';
import { HotelStateService } from '../../services/hotel-state.service';
import { ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { FilterState } from '../../models/hotel.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations'; // Import if animations are involved

// Create mock version of the HotelStateService
const createMockHotelStateService = () => {
  const initialFilterState: FilterState = {
    name: '',
    selectedStars: [],
    minRate: 0,
    maxPrice: 1000,
  };

  return {
    filterState$: new BehaviorSubject<FilterState>(initialFilterState),
    // Provide a default value for hasActiveFilters$ that can be spied on or changed
    hasActiveFilters$: new BehaviorSubject<boolean>(false),
    updateNameFilter: jasmine.createSpy('updateNameFilter'),
    updateStarsFilter: jasmine.createSpy('updateStarsFilter'),
    updateMinRateFilter: jasmine.createSpy('updateMinRateFilter'),
    updateMaxPriceFilter: jasmine.createSpy('updateMaxPriceFilter'),
    resetFilters: jasmine.createSpy('resetFilters'),
  };
};

describe('HotelFiltersComponent', () => {
  let component: HotelFiltersComponent;
  let fixture: ComponentFixture<HotelFiltersComponent>;
  let hotelStateServiceSpy: ReturnType<typeof createMockHotelStateService>;

  beforeEach(async () => {
    hotelStateServiceSpy = createMockHotelStateService();

    await TestBed.configureTestingModule({
      imports: [
        HotelFiltersComponent,
        ReactiveFormsModule,
        NoopAnimationsModule, // Add NoopAnimationsModule
      ],
      providers: [{ provide: HotelStateService, useValue: hotelStateServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(HotelFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Initial detection cycle
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default form values from service state', () => {
    // Values should match the initial state provided by the mock service
    expect(component.filterForm.get('name')?.value).toBe('');
    expect(component.filterForm.get('minRate')?.value).toBe(0);
    expect(component.filterForm.get('maxPrice')?.value).toBe(1000);
    expect(component.selectedStars).toEqual([]);
  });

  it('should update name filter when applyFilters is called', () => {
    const nameControl = component.filterForm.get('name');
    nameControl?.setValue('Barcelona');
    fixture.detectChanges(); // Update component state

    // Verify service was not called yet
    expect(hotelStateServiceSpy.updateNameFilter).not.toHaveBeenCalled();

    // Call applyFilters
    component.applyFilters();

    // Now service should be called with the form value
    expect(hotelStateServiceSpy.updateNameFilter).toHaveBeenCalledWith('Barcelona');
    // Verify other filters were also called by applyFilters with their current values
    expect(hotelStateServiceSpy.updateStarsFilter).toHaveBeenCalledWith([]);
    expect(hotelStateServiceSpy.updateMinRateFilter).toHaveBeenCalledWith(0);
    expect(hotelStateServiceSpy.updateMaxPriceFilter).toHaveBeenCalledWith(1000);
  });

  it('should update min rate filter when applyFilters is called', () => {
    const minRateControl = component.filterForm.get('minRate');
    minRateControl?.setValue(4);
    fixture.detectChanges();

    // Verify service was not called yet
    expect(hotelStateServiceSpy.updateMinRateFilter).not.toHaveBeenCalled();

    // Call applyFilters
    component.applyFilters();

    // Now service should be called
    expect(hotelStateServiceSpy.updateMinRateFilter).toHaveBeenCalledWith(4);
    // Verify other filters were also called by applyFilters
    expect(hotelStateServiceSpy.updateNameFilter).toHaveBeenCalledWith('');
    expect(hotelStateServiceSpy.updateStarsFilter).toHaveBeenCalledWith([]);
    expect(hotelStateServiceSpy.updateMaxPriceFilter).toHaveBeenCalledWith(1000);
  });

  it('should update max price filter when applyFilters is called', () => {
    const maxPriceControl = component.filterForm.get('maxPrice');
    maxPriceControl?.setValue(500);
    fixture.detectChanges();

    // Verify service was not called yet
    expect(hotelStateServiceSpy.updateMaxPriceFilter).not.toHaveBeenCalled();

    // Call applyFilters
    component.applyFilters();

    // Now service should be called
    expect(hotelStateServiceSpy.updateMaxPriceFilter).toHaveBeenCalledWith(500);
    // Verify other filters were also called by applyFilters
    expect(hotelStateServiceSpy.updateNameFilter).toHaveBeenCalledWith('');
    expect(hotelStateServiceSpy.updateStarsFilter).toHaveBeenCalledWith([]);
    expect(hotelStateServiceSpy.updateMinRateFilter).toHaveBeenCalledWith(0);
  });

  it('should update star filter selection locally and call service on applyFilters', () => {
    // Add a star
    component.onStarFilterChange(4, true);
    expect(component.selectedStars).toContain(4);
    // Service should NOT be called yet
    expect(hotelStateServiceSpy.updateStarsFilter).not.toHaveBeenCalled();

    // Call applyFilters
    component.applyFilters();
    // Now service should be called with the selected stars
    expect(hotelStateServiceSpy.updateStarsFilter).toHaveBeenCalledWith([4]);
    hotelStateServiceSpy.updateStarsFilter.calls.reset(); // Reset spy for next check

    // Add another star
    component.onStarFilterChange(5, true);
    expect(component.selectedStars).toEqual([4, 5]);
    expect(hotelStateServiceSpy.updateStarsFilter).not.toHaveBeenCalled(); // Still not called

    // Call applyFilters again
    component.applyFilters();
    expect(hotelStateServiceSpy.updateStarsFilter).toHaveBeenCalledWith([4, 5]);
    hotelStateServiceSpy.updateStarsFilter.calls.reset();

    // Remove a star
    component.onStarFilterChange(4, false);
    expect(component.selectedStars).toEqual([5]);
    expect(hotelStateServiceSpy.updateStarsFilter).not.toHaveBeenCalled(); // Still not called

    // Call applyFilters again
    component.applyFilters();
    expect(hotelStateServiceSpy.updateStarsFilter).toHaveBeenCalledWith([5]);
  });

  it('should reset all filters and call service reset', () => {
    // Set some values first
    component.filterForm.get('name')?.setValue('Test');
    component.filterForm.get('minRate')?.setValue(3);
    component.filterForm.get('maxPrice')?.setValue(500);
    component.selectedStars = [4, 5];
    fixture.detectChanges();

    // Reset filters
    component.resetFilters();
    fixture.detectChanges();

    // Check form was reset
    expect(component.filterForm.get('name')?.value).toBe('');
    expect(component.filterForm.get('minRate')?.value).toBe(0);
    expect(component.filterForm.get('maxPrice')?.value).toBe(1000);
    expect(component.selectedStars).toEqual([]);

    // Check service was called
    expect(hotelStateServiceSpy.resetFilters).toHaveBeenCalledTimes(1);
  });

  it('should remove name filter and call service update', () => {
    // Set name filter initially in the state
    hotelStateServiceSpy.filterState$.next({
      name: 'Test',
      selectedStars: [],
      minRate: 0,
      maxPrice: 1000,
    });
    fixture.detectChanges(); // Update component with state

    // Remove the filter
    component.removeFilter('name');
    fixture.detectChanges();

    // Check filter was removed in form
    expect(component.filterForm.get('name')?.value).toBe('');
    // Check service was called to update the state
    expect(hotelStateServiceSpy.updateNameFilter).toHaveBeenCalledWith('');
  });

  it('should remove star filter and call service update', () => {
    // Set star filter initially in the state
    hotelStateServiceSpy.filterState$.next({
      name: '',
      selectedStars: [3, 4],
      minRate: 0,
      maxPrice: 1000,
    });
    fixture.detectChanges(); // Update component with state
    expect(component.selectedStars).toEqual([3, 4]); // Verify initial state applied

    // Remove star 3
    component.removeFilter('stars', 3);
    fixture.detectChanges();

    // Check filter was removed locally
    expect(component.selectedStars).toEqual([4]);
    // Check service was called to update the state
    expect(hotelStateServiceSpy.updateStarsFilter).toHaveBeenCalledWith([4]);
  });

  it('should remove minRate filter and call service update', () => {
    // Set minRate filter initially in the state
    hotelStateServiceSpy.filterState$.next({
      name: '',
      selectedStars: [],
      minRate: 3,
      maxPrice: 1000,
    });
    fixture.detectChanges(); // Update component with state

    // Remove the filter
    component.removeFilter('minRate');
    fixture.detectChanges();

    // Check filter was removed in form
    expect(component.filterForm.get('minRate')?.value).toBe(0);
    // Check service was called to update the state
    expect(hotelStateServiceSpy.updateMinRateFilter).toHaveBeenCalledWith(0);
  });

  it('should remove maxPrice filter and call service update', () => {
    // Set maxPrice filter initially in the state
    hotelStateServiceSpy.filterState$.next({
      name: '',
      selectedStars: [],
      minRate: 0,
      maxPrice: 500,
    });
    fixture.detectChanges(); // Update component with state

    // Remove the filter
    component.removeFilter('maxPrice');
    fixture.detectChanges();

    // Check filter was removed in form
    expect(component.filterForm.get('maxPrice')?.value).toBe(1000);
    // Check service was called to update the state
    expect(hotelStateServiceSpy.updateMaxPriceFilter).toHaveBeenCalledWith(1000);
  });

  it('should enable apply button only when there are pending changes', () => {
    // Initially, no pending changes
    expect(component.hasPendingChanges()).toBeFalse();

    // Change name
    component.filterForm.get('name')?.setValue('Test');
    expect(component.hasPendingChanges()).toBeTrue();

    // Apply changes (simulated by updating appliedFilters)
    component.applyFilters();
    hotelStateServiceSpy.filterState$.next({
      name: 'Test',
      selectedStars: [],
      minRate: 0,
      maxPrice: 1000,
    });
    fixture.detectChanges();
    expect(component.hasPendingChanges()).toBeFalse();

    // Change stars
    component.onStarFilterChange(3, true);
    expect(component.hasPendingChanges()).toBeTrue();

    // Apply changes
    component.applyFilters();
    hotelStateServiceSpy.filterState$.next({
      name: 'Test',
      selectedStars: [3],
      minRate: 0,
      maxPrice: 1000,
    });
    fixture.detectChanges();
    expect(component.hasPendingChanges()).toBeFalse();

    // Change minRate
    component.filterForm.get('minRate')?.setValue(2);
    expect(component.hasPendingChanges()).toBeTrue();

    // Apply changes
    component.applyFilters();
    hotelStateServiceSpy.filterState$.next({
      name: 'Test',
      selectedStars: [3],
      minRate: 2,
      maxPrice: 1000,
    });
    fixture.detectChanges();
    expect(component.hasPendingChanges()).toBeFalse();

    // Change maxPrice
    component.filterForm.get('maxPrice')?.setValue(500);
    expect(component.hasPendingChanges()).toBeTrue();

    // Apply changes
    component.applyFilters();
    hotelStateServiceSpy.filterState$.next({
      name: 'Test',
      selectedStars: [3],
      minRate: 2,
      maxPrice: 500,
    });
    fixture.detectChanges();
    expect(component.hasPendingChanges()).toBeFalse();

    // Reset filters via button
    component.resetFilters(); // This calls the service, which should update the state
    hotelStateServiceSpy.filterState$.next({
      name: '',
      selectedStars: [],
      minRate: 0,
      maxPrice: 1000,
    });
    fixture.detectChanges();
    expect(component.hasPendingChanges()).toBeFalse();
  });

  it('should sync form and selectedStars when filterState$ emits', () => {
    const newState: FilterState = {
      name: 'From State',
      selectedStars: [1, 5],
      minRate: 2,
      maxPrice: 800,
    };
    hotelStateServiceSpy.filterState$.next(newState);
    fixture.detectChanges();

    expect(component.filterForm.value).toEqual({
      name: 'From State',
      minRate: 2,
      maxPrice: 800,
    });
    expect(component.selectedStars).toEqual([1, 5]);
  });
});
