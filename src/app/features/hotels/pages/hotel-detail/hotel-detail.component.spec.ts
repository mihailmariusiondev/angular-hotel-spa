import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { BehaviorSubject, ReplaySubject, of, throwError, Subject } from 'rxjs'; // Import Subject
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';

import { HotelDetailComponent } from './hotel-detail.component';
import { HotelStateService } from '../../services/hotel-state.service';
import { HotelsService } from '../../services/hotels.service';
import { Hotel, HotelsState } from '../../models/hotel.model';
import { HttpErrorResponse } from '@angular/common/http';

// --- Mocks ---
const mockHotel1: Hotel = {
  id: 'hotel-1',
  name: 'Hotel One',
  image: 'image1.jpg',
  address: '1 Test St',
  stars: 4,
  rate: 4.5,
  price: 150,
  description: 'Description 1',
};
const mockHotel2: Hotel = {
  id: 'hotel-2',
  name: 'Hotel Two',
  image: 'image2.jpg',
  address: '2 Test Ave',
  stars: 5,
  rate: 4.8,
  price: 250,
  description: 'Description 2',
};
const mockInitialState: HotelsState = {
  data: [],
  filters: { name: '', selectedStars: [], minRate: 0, maxPrice: 1000 },
  sort: { sortBy: null, sortDirection: 'asc' },
  pagination: { currentPage: 1, pageSize: 9, totalItems: 0 },
};

describe('HotelDetailComponent (Reactive)', () => {
  let component: HotelDetailComponent;
  let fixture: ComponentFixture<HotelDetailComponent>;
  let mockHotelStateSubject: BehaviorSubject<HotelsState>;
  let mockParamMapSubject: ReplaySubject<ParamMap>;
  let hotelsServiceSpy: jasmine.SpyObj<HotelsService>;

  beforeEach(async () => {
    hotelsServiceSpy = jasmine.createSpyObj('HotelsService', [
      'getHotelById',
      'getHotelsWithOptions',
    ]);
    // Provide a default return value for getHotelById to avoid errors in tests
    // where the call is made but the result isn't immediately needed or checked.
    // Using 'of()' is simple, 'NEVER' or 'Subject' could also work.
    hotelsServiceSpy.getHotelById.and.returnValue(of(mockHotel1)); // Default mock

    mockHotelStateSubject = new BehaviorSubject<HotelsState>({ ...mockInitialState });
    mockParamMapSubject = new ReplaySubject<ParamMap>(1);

    await TestBed.configureTestingModule({
      imports: [CommonModule, RouterTestingModule, HttpClientTestingModule, HotelDetailComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: mockParamMapSubject.asObservable() } },
        { provide: HotelStateService, useValue: { state$: mockHotelStateSubject.asObservable() } },
        { provide: HotelsService, useValue: hotelsServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HotelDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges(); // Initial change detection
    expect(component).toBeTruthy();
    expect(component.hotel$).toBeDefined();
  });

  it('should display loading initially when route param is provided but data not yet resolved', fakeAsync(() => {
    // Reset spy for this specific test if needed, or rely on default from beforeEach
    hotelsServiceSpy.getHotelById.and.returnValue(new Subject<Hotel>()); // Use Subject to delay emission

    fixture.detectChanges(); // Trigger initial component setup and subscription to paramMap
    tick(); // Allow async operations like subscription to complete

    mockParamMapSubject.next(convertToParamMap({ id: mockHotel1.id }));
    fixture.detectChanges(); // Trigger the observable pipeline

    // Check for spinner *before* tick() that would resolve the API call
    const spinner = fixture.debugElement.query(By.css('.spinner-border'));
    expect(spinner).toBeTruthy(); // Should be loading initially

    // No tick needed here if just checking initial state
    // tick(); // Advance time if needed for async operations later in the test
    // fixture.detectChanges(); // Update view after potential async ops
  }));

  it('should find hotel in state and NOT call API', fakeAsync(() => {
    mockHotelStateSubject.next({ ...mockInitialState, data: [mockHotel1, mockHotel2] });
    mockParamMapSubject.next(convertToParamMap({ id: mockHotel1.id }));

    fixture.detectChanges(); // Trigger observable pipeline
    tick(); // Allow observables time to emit
    fixture.detectChanges(); // Update view with emitted value

    let emittedHotel: Hotel | undefined;
    component.hotel$.subscribe(h => (emittedHotel = h));
    tick(); // Allow subscription to receive value
    expect(emittedHotel).toEqual(mockHotel1);

    expect(hotelsServiceSpy.getHotelById).not.toHaveBeenCalled(); // Verify API was not called

    // Check the DOM
    const title = fixture.debugElement.query(By.css('.card-title'));
    expect(title.nativeElement.textContent).toContain(mockHotel1.name);
    const spinner = fixture.debugElement.query(By.css('.spinner-border'));
    expect(spinner).toBeFalsy(); // No spinner should be shown
  }));

  it('should NOT find hotel in state, call API successfully, and display hotel', fakeAsync(() => {
    mockHotelStateSubject.next({ ...mockInitialState, data: [mockHotel2] }); // Hotel 1 is not in state
    hotelsServiceSpy.getHotelById.and.returnValue(of(mockHotel1)); // Mock API to return Hotel 1
    mockParamMapSubject.next(convertToParamMap({ id: mockHotel1.id }));

    fixture.detectChanges();
    tick(); // Allow switchMap and API call (mocked)
    fixture.detectChanges();

    let emittedHotel: Hotel | undefined;
    component.hotel$.subscribe(h => (emittedHotel = h));
    tick(); // Allow subscription
    expect(emittedHotel).toEqual(mockHotel1);

    expect(hotelsServiceSpy.getHotelById).toHaveBeenCalledOnceWith(mockHotel1.id); // Verify API call

    // Check the DOM
    const title = fixture.debugElement.query(By.css('.card-title'));
    expect(title.nativeElement.textContent).toContain(mockHotel1.name);
    const spinner = fixture.debugElement.query(By.css('.spinner-border'));
    expect(spinner).toBeFalsy();
  }));

  it('should NOT find hotel in state, call API fails (404), and show loading state (spinner)', fakeAsync(() => {
    mockHotelStateSubject.next({ ...mockInitialState, data: [] }); // Empty state
    const errorResponse = new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
    hotelsServiceSpy.getHotelById.and.returnValue(throwError(() => errorResponse)); // Mock API error
    const nonExistentId = 'hotel-404';
    mockParamMapSubject.next(convertToParamMap({ id: nonExistentId }));

    fixture.detectChanges();
    tick(); // Allow observable pipeline including catchError
    fixture.detectChanges(); // Update view

    let emittedHotel: Hotel | undefined = mockHotel1; // Dummy value to ensure it changes
    let errorOccurred = false;
    component.hotel$.subscribe({
      next: h => (emittedHotel = h),
      error: () => (errorOccurred = true), // Catch potential errors in the test observable itself
    });
    tick(); // Allow subscription

    // Expect hotel$ to emit undefined due to catchError(of(undefined))
    expect(emittedHotel).toBeUndefined();
    expect(errorOccurred).toBeFalse(); // The component observable should handle the error internally

    expect(hotelsServiceSpy.getHotelById).toHaveBeenCalledOnceWith(nonExistentId);

    // Check the DOM
    const spinner = fixture.debugElement.query(By.css('.spinner-border'));
    // Since catchError returns of(undefined), the @else block in the template should render
    expect(spinner).toBeTruthy();
    const detailContainer = fixture.debugElement.query(By.css('.detail-container'));
    expect(detailContainer).toBeFalsy(); // The detail container should not be rendered
  }));

  it('should handle missing ID in route params gracefully and show loading state', fakeAsync(() => {
    mockParamMapSubject.next(convertToParamMap({})); // Empty params

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    let emissionCount = 0;
    component.hotel$.subscribe(() => {
      emissionCount++;
    });
    tick();
    // The filter operator should prevent emission if ID is missing
    expect(emissionCount).toBe(0);

    expect(hotelsServiceSpy.getHotelById).not.toHaveBeenCalled(); // No API call if no ID

    // Check the DOM
    const spinner = fixture.debugElement.query(By.css('.spinner-border'));
    // The @else block (loading) should be shown as hotel$ didn't emit a hotel
    expect(spinner).toBeTruthy();
  }));

  // --- Other tests ---
  it('starsArray should return correct array', () => {
    expect(component.starsArray(4)).toEqual([0, 0, 0, 0]);
    expect(component.starsArray(0)).toEqual([]);
    expect(component.starsArray(5)).toEqual([0, 0, 0, 0, 0]);
    expect(component.starsArray(6)).toEqual([0, 0, 0, 0, 0]); // Should cap at 5
    expect(component.starsArray(-1)).toEqual([]); // Should handle negative
    expect(component.starsArray(3.7)).toEqual([0, 0, 0]); // Should floor
  });

  it('should handle image error in the template', fakeAsync(() => {
    // hotelsServiceSpy.getHotelById.and.returnValue(of(mockHotel1)); // Use default mock from beforeEach
    mockParamMapSubject.next(convertToParamMap({ id: mockHotel1.id }));
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const image = fixture.debugElement.query(By.css('.detail-img')); // <-- Selector corregido
    expect(image).toBeTruthy();
    const imgElement = image.nativeElement as HTMLImageElement;
    expect(imgElement.src).toContain(mockHotel1.image); // Check initial src

    // Simulate error
    imgElement.dispatchEvent(new Event('error'));
    fixture.detectChanges(); // Update view after error

    // Check if src changed to default
    expect(imgElement.src).toBe(component.defaultImageUrl);
  }));

  it('should have a working back button link', fakeAsync(() => {
    // hotelsServiceSpy.getHotelById.and.returnValue(of(mockHotel1)); // Use default mock
    mockParamMapSubject.next(convertToParamMap({ id: mockHotel1.id }));
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const backButton = fixture.debugElement.query(By.css('a[routerLink="/hotels"]'));

    expect(backButton).toBeTruthy();
    // Check the routerLink attribute directly
    expect(backButton.attributes['routerLink']).toBe('/hotels');
  }));
});
