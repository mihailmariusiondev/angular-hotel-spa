import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HotelPaginationComponent } from './hotel-pagination.component';
import { HotelStateService } from '../../services/hotel-state.service';
import { BehaviorSubject, take } from 'rxjs';
import { PaginationState, AVAILABLE_PAGE_SIZES } from '../../models/hotel.model'; // Import AVAILABLE_PAGE_SIZES
import { By } from '@angular/platform-browser'; // Import By for querying elements

describe('HotelPaginationComponent', () => {
  let component: HotelPaginationComponent;
  let fixture: ComponentFixture<HotelPaginationComponent>;
  let hotelStateServiceSpy: jasmine.SpyObj<HotelStateService>;
  let paginationStateSubject: BehaviorSubject<PaginationState>;

  // Initial pagination state
  const initialPaginationState: PaginationState = {
    currentPage: 2,
    pageSize: AVAILABLE_PAGE_SIZES[0], // Use the constant
    totalItems: 27,
  };

  beforeEach(async () => {
    paginationStateSubject = new BehaviorSubject<PaginationState>(initialPaginationState);

    const spy = jasmine.createSpyObj(
      'HotelStateService',
      ['goToPage', 'nextPage', 'previousPage', 'firstPage', 'lastPage', 'updatePageSize'], // Add updatePageSize
      {
        paginationState$: paginationStateSubject.asObservable(),
      }
    );

    await TestBed.configureTestingModule({
      imports: [HotelPaginationComponent],
      providers: [{ provide: HotelStateService, useValue: spy }],
    }).compileComponents();

    hotelStateServiceSpy = TestBed.inject(HotelStateService) as jasmine.SpyObj<HotelStateService>;
    fixture = TestBed.createComponent(HotelPaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Initial detectChanges
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate total pages correctly', done => {
    // Update state for this specific test if needed
    const stateForTotalPages: PaginationState = { currentPage: 1, pageSize: 9, totalItems: 27 };
    paginationStateSubject.next(stateForTotalPages);
    fixture.detectChanges();

    component.totalPages$.pipe(take(1)).subscribe(totalPages => {
      expect(totalPages).toBe(3);
      done();
    });
  });

  it('should calculate results info correctly', done => {
    // Update state for this specific test
    const stateForResultsInfo: PaginationState = { currentPage: 2, pageSize: 9, totalItems: 27 };
    paginationStateSubject.next(stateForResultsInfo);
    fixture.detectChanges();

    component.resultsInfo$.pipe(take(1)).subscribe(info => {
      expect(info.start).toBe(10);
      expect(info.end).toBe(18);
      expect(info.total).toBe(27);
      done();
    });
  });

  it('should go to specific page', () => {
    component.goToPage(3);
    expect(hotelStateServiceSpy.goToPage).toHaveBeenCalledWith(3);
  });

  it('should go to next page', () => {
    component.nextPage();
    expect(hotelStateServiceSpy.nextPage).toHaveBeenCalled();
  });

  it('should go to previous page', () => {
    component.previousPage();
    expect(hotelStateServiceSpy.previousPage).toHaveBeenCalled();
  });

  it('should go to first page', () => {
    component.firstPage();
    expect(hotelStateServiceSpy.firstPage).toHaveBeenCalled();
  });

  it('should go to last page', () => {
    component.lastPage();
    expect(hotelStateServiceSpy.lastPage).toHaveBeenCalled();
  });

  it('should call updatePageSize on page size change', () => {
    const newPageSize = AVAILABLE_PAGE_SIZES[1]; // e.g., 18
    // Ensure the select element exists before trying to interact with it
    const selectElement = fixture.debugElement.query(By.css('#pageSizeSelect'));
    expect(selectElement).withContext('Page size select element should exist').toBeTruthy();

    // Set the value and dispatch the change event
    selectElement.nativeElement.value = newPageSize.toString();
    selectElement.nativeElement.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(hotelStateServiceSpy.updatePageSize).toHaveBeenCalledWith(newPageSize);
  });

  it('should display the correct available page sizes in the select', () => {
    // Ensure the component renders with some totalItems to show the select
    paginationStateSubject.next({ ...initialPaginationState, totalItems: 10 });
    fixture.detectChanges();

    const selectElement = fixture.debugElement.query(By.css('#pageSizeSelect'));
    expect(selectElement).toBeTruthy(); // Check if select is rendered

    const optionElements = selectElement.queryAll(By.css('option'));
    expect(optionElements.length).toBe(AVAILABLE_PAGE_SIZES.length);

    optionElements.forEach((optionEl, index) => {
      expect(optionEl.nativeElement.value).toBe(AVAILABLE_PAGE_SIZES[index].toString());
      expect(optionEl.nativeElement.textContent).toContain(AVAILABLE_PAGE_SIZES[index].toString());
    });
  });

  it('should handle empty results case for results info', done => {
    const emptyState: PaginationState = { currentPage: 1, pageSize: 9, totalItems: 0 };
    paginationStateSubject.next(emptyState); // Emit empty state
    fixture.detectChanges(); // Trigger change detection

    component.resultsInfo$.pipe(take(1)).subscribe(info => {
      expect(info.start).toBe(0);
      expect(info.end).toBe(0);
      expect(info.total).toBe(0);
      done();
    });
  });

  it('should handle last page with partial results for results info', done => {
    const partialState: PaginationState = { currentPage: 3, pageSize: 10, totalItems: 25 };
    paginationStateSubject.next(partialState); // Emit partial state
    fixture.detectChanges(); // Trigger change detection

    component.resultsInfo$.pipe(take(1)).subscribe(info => {
      expect(info.start).toBe(21);
      expect(info.end).toBe(25);
      expect(info.total).toBe(25);
      done();
    });
  });

  it('should correctly reflect the current page size in the select element', () => {
    const testPageSize = AVAILABLE_PAGE_SIZES[2]; // e.g., 27
    paginationStateSubject.next({
      ...initialPaginationState,
      pageSize: testPageSize,
      totalItems: 50,
    });
    fixture.detectChanges();

    const selectElement = fixture.debugElement.query(By.css('#pageSizeSelect'));
    expect(selectElement).toBeTruthy();
    expect(selectElement.nativeElement.value).toBe(testPageSize.toString());
  });

  // Removed the TestBed reset logic as it's generally better practice
  // to re-initialize the subject (`paginationStateSubject.next(...)`) within each test
  // or structure `beforeEach` to handle different initial states if needed per test suite.
});
