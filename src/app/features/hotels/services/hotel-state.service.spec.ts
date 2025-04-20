import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HotelStateService } from './hotel-state.service';
import { HotelsService } from './hotels.service';
import { LoadingService } from '../../../core/services/loading.service';
import { of, throwError } from 'rxjs';
import { Hotel, HotelsState } from '../models/hotel.model';

describe('HotelStateService', () => {
  let service: HotelStateService;
  let hotelsSpy: jasmine.SpyObj<HotelsService>;
  let loadingSpy: jasmine.SpyObj<LoadingService>;
  // Mock response ahora sigue la nueva estructura { data, totalItems }
  const mockResponse: { data: Hotel[]; totalItems: number } = {
    totalItems: 10,
    data: [
      {
        id: '1',
        name: 'A',
        image: '',
        address: '',
        stars: 5,
        rate: 4,
        price: 100,
        description: '',
      },
    ],
  };

  beforeEach(() => {
    hotelsSpy = jasmine.createSpyObj('HotelsService', ['getHotelsWithOptions']);
    loadingSpy = jasmine.createSpyObj('LoadingService', ['show', 'hide']);
    TestBed.configureTestingModule({
      providers: [
        HotelStateService,
        { provide: HotelsService, useValue: hotelsSpy },
        { provide: LoadingService, useValue: loadingSpy },
      ],
    });
    service = TestBed.inject(HotelStateService);
  });

  it('should be created', () => expect(service).toBeTruthy());

  it('initializeData triggers fetchHotels', () => {
    hotelsSpy.getHotelsWithOptions.and.returnValue(of(mockResponse));
    service.initializeData();
    expect(loadingSpy.show).toHaveBeenCalled();
    expect(hotelsSpy.getHotelsWithOptions).toHaveBeenCalled();
  });

  it('fetchHotels success updates data and pagination', fakeAsync(() => {
    const states: HotelsState[] = [];
    hotelsSpy.getHotelsWithOptions.and.returnValue(of(mockResponse));
    service.state$.subscribe(s => states.push(s));
    service.initializeData();
    tick();
    const last = states[states.length - 1];
    expect(last.data.length).toBe(1);
    expect(last.pagination.totalItems).toBe(10);
    expect(loadingSpy.hide).toHaveBeenCalled();
  }));

  it('fetchHotels error resets to initial pagination', fakeAsync(() => {
    const states: HotelsState[] = [];
    hotelsSpy.getHotelsWithOptions.and.returnValue(throwError(() => new Error('err')));
    service.state$.subscribe(s => states.push(s));
    service.initializeData();
    tick();
    const last = states[states.length - 1];
    expect(last.data).toEqual([]);
    expect(last.pagination.currentPage).toBe(1);
    expect(loadingSpy.hide).toHaveBeenCalled();
  }));

  it('updateNameFilter only on change', fakeAsync(() => {
    const states: HotelsState[] = [];
    hotelsSpy.getHotelsWithOptions.and.returnValue(of(mockResponse));
    service.state$.subscribe(s => states.push(s));
    service.updateNameFilter('X');
    tick();
    expect(states[states.length - 1].filters.name).toBe('X');
    hotelsSpy.getHotelsWithOptions.calls.reset();
    service.updateNameFilter('X');
    expect(hotelsSpy.getHotelsWithOptions).not.toHaveBeenCalled();
  }));

  it('updateStarsFilter triggers only on actual changes', fakeAsync(() => {
    const states: HotelsState[] = [];
    hotelsSpy.getHotelsWithOptions.and.returnValue(of(mockResponse));
    service.state$.subscribe(s => states.push(s));
    service.updateStarsFilter([5]);
    tick();
    expect(states[states.length - 1].filters.selectedStars).toEqual([5]);
    hotelsSpy.getHotelsWithOptions.calls.reset();
    service.updateStarsFilter([5]);
    expect(hotelsSpy.getHotelsWithOptions).not.toHaveBeenCalled();
  }));

  it('updateMinRateFilter and updateMaxPriceFilter', fakeAsync(() => {
    const states: HotelsState[] = [];
    hotelsSpy.getHotelsWithOptions.and.returnValue(of(mockResponse));
    service.state$.subscribe(s => states.push(s));
    service.updateMinRateFilter(2);
    tick();
    expect(states[states.length - 1].filters.minRate).toBe(2);
    service.updateMaxPriceFilter(500);
    tick();
    expect(states[states.length - 1].filters.maxPrice).toBe(500);
  }));

  it('updateSort resets page and fetches only on change', fakeAsync(() => {
    const states: HotelsState[] = [];
    hotelsSpy.getHotelsWithOptions.and.returnValue(of(mockResponse));
    service.state$.subscribe(s => states.push(s));
    service.updateSort('price', 'desc');
    tick();
    const last = states[states.length - 1].sort;
    expect(last.sortBy).toBe('price');
    expect(last.sortDirection).toBe('desc');
    hotelsSpy.getHotelsWithOptions.calls.reset();
    service.updateSort('price', 'desc');
    expect(hotelsSpy.getHotelsWithOptions).not.toHaveBeenCalled();
  }));

  it('pagination methods: invalid no fetch; valid changes', fakeAsync(() => {
    hotelsSpy.getHotelsWithOptions.and.returnValue(of(mockResponse));
    service.initializeData();
    tick();
    hotelsSpy.getHotelsWithOptions.calls.reset();
    service.goToPage(0);
    service.goToPage(3);
    expect(hotelsSpy.getHotelsWithOptions).not.toHaveBeenCalled();
    const states: HotelsState[] = [];
    service.state$.subscribe(s => states.push(s));
    service.goToPage(2);
    tick();
    expect(states[states.length - 1].pagination.currentPage).toBe(2);
  }));

  it('next/prev/first/last page controls', fakeAsync(() => {
    hotelsSpy.getHotelsWithOptions.and.returnValue(of(mockResponse));
    const pages: number[] = [];
    service.state$.subscribe(s => pages.push(s.pagination.currentPage));
    service.initializeData();
    tick();
    service.nextPage();
    tick();
    service.nextPage();
    tick();
    service.previousPage();
    tick();
    service.firstPage();
    tick();
    service.lastPage();
    tick();
    expect(pages).toEqual([1, 1, 2, 2, 1, 1, 2, 2]);
  }));

  it('resetFilters logic', fakeAsync(() => {
    hotelsSpy.getHotelsWithOptions.and.returnValue(of(mockResponse));
    const pages: HotelsState[] = [];
    service.state$.subscribe(s => pages.push(s));
    service.updateNameFilter('a');
    tick();
    service.resetFilters();
    tick();
    expect(pages[pages.length - 1].filters.name).toBe('');
    service.goToPage(2);
    tick();
    service.resetFilters();
    tick();
    expect(pages[pages.length - 1].pagination.currentPage).toBe(1);
  }));
});
