import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HotelsListComponent } from './hotel-list.component';
import { HotelStateService } from '../../services/hotel-state.service';
import { LoadingService } from '@app/core/services/loading.service';
import { BehaviorSubject } from 'rxjs';
import { skip } from 'rxjs/operators';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Hotel, FilterState } from '../../models/hotel.model';

describe('HotelsListComponent', () => {
  let component: HotelsListComponent;
  let fixture: ComponentFixture<HotelsListComponent>;
  let hotelState: {
    paginatedHotels$: BehaviorSubject<Hotel[]>;
    filterState$: BehaviorSubject<FilterState>;
    initializeData: jasmine.Spy;
  };
  let loadingService: { loading$: BehaviorSubject<boolean> };

  beforeEach(async () => {
    hotelState = {
      paginatedHotels$: new BehaviorSubject<Hotel[]>([]),
      filterState$: new BehaviorSubject<FilterState>({
        name: '',
        selectedStars: [],
        minRate: 0,
        maxPrice: 1000,
      }),
      initializeData: jasmine.createSpy('initializeData'),
    };
    loadingService = { loading$: new BehaviorSubject<boolean>(false) };

    await TestBed.configureTestingModule({
      imports: [HotelsListComponent],
      providers: [
        { provide: HotelStateService, useValue: hotelState },
        { provide: LoadingService, useValue: loadingService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(HotelsListComponent);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit calls initializeData', () => {
    component.ngOnInit();
    expect(hotelState.initializeData).toHaveBeenCalled();
  });

  it('trackByHotelId returns hotel.id', () => {
    const h = {
      id: 'X',
      name: '',
      image: '',
      address: '',
      stars: 0,
      rate: 0,
      price: 0,
      description: '',
    };
    expect(component.trackByHotelId(0, h)).toBe('X');
  });

  it('hotels$ emits from service', done => {
    const list = [
      { id: '1', name: '', image: '', address: '', stars: 1, rate: 1, price: 1, description: '' },
    ];
    component.hotels$.pipe(skip(1)).subscribe(data => {
      expect(data).toEqual(list);
      done();
    });
    hotelState.paginatedHotels$.next(list);
  });

  it('hasNoResults$ false: no filters, no hotels, not loading', done => {
    hotelState.filterState$.next({ name: '', selectedStars: [], minRate: 0, maxPrice: 1000 });
    hotelState.paginatedHotels$.next([]);
    loadingService.loading$.next(false);
    component.hasNoResults$.subscribe(val => {
      expect(val).toBeFalse();
      done();
    });
  });

  it('hasNoResults$ false: no filters, hotels exist', done => {
    hotelState.filterState$.next({ name: '', selectedStars: [], minRate: 0, maxPrice: 1000 });
    hotelState.paginatedHotels$.next([
      { id: '2', name: '', image: '', address: '', stars: 2, rate: 2, price: 2, description: '' },
    ]);
    loadingService.loading$.next(false);
    component.hasNoResults$.subscribe(val => {
      expect(val).toBeFalse();
      done();
    });
  });

  it('hasNoResults$ false: filters active, hotels exist', done => {
    hotelState.filterState$.next({ name: 'a', selectedStars: [5], minRate: 1, maxPrice: 999 });
    hotelState.paginatedHotels$.next([
      { id: '3', name: '', image: '', address: '', stars: 5, rate: 5, price: 5, description: '' },
    ]);
    loadingService.loading$.next(false);
    component.hasNoResults$.subscribe(val => {
      expect(val).toBeFalse();
      done();
    });
  });

  it('hasNoResults$ true: filters active, no hotels, not loading', done => {
    hotelState.filterState$.next({ name: 'x', selectedStars: [1], minRate: 2, maxPrice: 500 });
    hotelState.paginatedHotels$.next([]);
    loadingService.loading$.next(false);
    component.hasNoResults$.subscribe(val => {
      expect(val).toBeTrue();
      done();
    });
  });

  it('hasNoResults$ false: loading true', done => {
    hotelState.filterState$.next({ name: 'x', selectedStars: [1], minRate: 2, maxPrice: 500 });
    hotelState.paginatedHotels$.next([]);
    loadingService.loading$.next(true);
    component.hasNoResults$.subscribe(val => {
      expect(val).toBeFalse();
      done();
    });
  });
});
