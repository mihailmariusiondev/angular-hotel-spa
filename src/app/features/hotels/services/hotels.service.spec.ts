import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import { HttpHeaders } from '@angular/common/http';
import { HotelsService } from './hotels.service';
import { Hotel, GetHotelsOptions } from '../models/hotel.model';

describe('HotelsService', () => {
  let service: HotelsService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000/hotels';

  // Ayudante para crear opciones por defecto
  const createDefaultOptions = (): GetHotelsOptions => ({
    filters: { name: '', selectedStars: [], minRate: 0, maxPrice: 1000 },
    sort: { sortBy: null, sortDirection: 'asc' },
    pagination: { currentPage: 1, pageSize: 10, totalItems: 0 },
  });

  // Ayudante para crear una respuesta simulada (ahora solo datos y total)
  const createMockResponseData = (
    data: Hotel[] = [],
    totalItems = 0
  ): { data: Hotel[]; totalItems: number } => ({
    data,
    totalItems,
  });

  // Ayudante para simular la respuesta HTTP con cabeceras
  const flushMockResponse = (req: TestRequest, data: Hotel[], totalItems: number): void => {
    req.flush(data, {
      headers: new HttpHeaders({ 'X-Total-Count': totalItems.toString() }),
    });
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HotelsService],
    });
    service = TestBed.inject(HotelsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch hotels with only pagination (page 1)', () => {
    const mockOptions = createDefaultOptions();
    const mockData: Hotel[] = [];
    const totalItems = 50;
    const expectedResponse = createMockResponseData(mockData, totalItems);

    service.getHotelsWithOptions(mockOptions).subscribe(response => {
      expect(response).toEqual(expectedResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}?_page=1&_limit=10`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('_page')).toBe('1');
    expect(req.request.params.get('_limit')).toBe('10');
    expect(req.request.params.has('_sort')).toBeFalse();
    expect(req.request.params.has('name_like')).toBeFalse();
    expect(req.request.params.has('stars')).toBeFalse();
    expect(req.request.params.has('rate_gte')).toBeFalse();
    expect(req.request.params.has('price_lte')).toBeFalse();
    flushMockResponse(req, mockData, totalItems);
  });

  it('should fetch hotels with pagination and sorting', () => {
    const mockOptions: GetHotelsOptions = {
      ...createDefaultOptions(),
      sort: { sortBy: 'name', sortDirection: 'desc' },
      pagination: { currentPage: 3, pageSize: 5, totalItems: 0 },
    };
    const mockData: Hotel[] = [];
    const totalItems = 100;
    const expectedResponse = createMockResponseData(mockData, totalItems);

    service.getHotelsWithOptions(mockOptions).subscribe(response => {
      expect(response).toEqual(expectedResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}?_page=3&_limit=5&_sort=name&_order=desc`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('_page')).toBe('3');
    expect(req.request.params.get('_limit')).toBe('5');
    expect(req.request.params.get('_sort')).toBe('name');
    expect(req.request.params.get('_order')).toBe('desc');
    expect(req.request.params.has('name_like')).toBeFalse();
    expect(req.request.params.has('stars')).toBeFalse();
    expect(req.request.params.has('rate_gte')).toBeFalse();
    expect(req.request.params.has('price_lte')).toBeFalse();
    flushMockResponse(req, mockData, totalItems);
  });

  it('should fetch hotels with pagination and filtering', () => {
    const mockOptions: GetHotelsOptions = {
      ...createDefaultOptions(),
      filters: { name: 'Grand', selectedStars: [5], minRate: 4.5, maxPrice: 300 },
      pagination: { currentPage: 1, pageSize: 10, totalItems: 0 },
    };
    const mockData: Hotel[] = [];
    const totalItems = 15;
    const expectedResponse = createMockResponseData(mockData, totalItems);

    service.getHotelsWithOptions(mockOptions).subscribe(response => {
      expect(response).toEqual(expectedResponse);
    });

    const req = httpMock.expectOne(
      `${apiUrl}?_page=1&_limit=10&name_like=Grand&stars=5&rate_gte=4.5&price_lte=300`
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('_page')).toBe('1');
    expect(req.request.params.get('_limit')).toBe('10');
    expect(req.request.params.has('_sort')).toBeFalse();
    expect(req.request.params.get('name_like')).toBe('Grand');
    expect(req.request.params.getAll('stars')).toEqual(['5']);
    expect(req.request.params.get('rate_gte')).toBe('4.5');
    expect(req.request.params.get('price_lte')).toBe('300');
    flushMockResponse(req, mockData, totalItems);
  });

  it('should fetch hotels with all options (pagination, sort, filter)', () => {
    const mockOptions: GetHotelsOptions = {
      filters: { name: 'Test', selectedStars: [3, 4], minRate: 3.5, maxPrice: 500 },
      sort: { sortBy: 'price', sortDirection: 'asc' },
      pagination: { currentPage: 2, pageSize: 10, totalItems: 0 },
    };
    const mockHotels: Hotel[] = [
      {
        id: '1',
        name: 'Hotel Test A',
        image: 'img1.jpg',
        address: 'Addr A',
        stars: 3,
        rate: 3.8,
        price: 100,
        description: 'Description A',
      },
    ];
    const totalItems = 35;
    const expectedResponse = createMockResponseData(mockHotels, totalItems);

    service.getHotelsWithOptions(mockOptions).subscribe(response => {
      expect(response).toEqual(expectedResponse);
      expect(response.data.length).toBe(1);
    });

    const req = httpMock.expectOne(
      `${apiUrl}?_page=2&_limit=10&_sort=price&_order=asc&name_like=Test&stars=3&stars=4&rate_gte=3.5&price_lte=500`
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('_page')).toBe('2');
    expect(req.request.params.get('_limit')).toBe('10');
    expect(req.request.params.get('_sort')).toBe('price');
    expect(req.request.params.get('_order')).toBe('asc');
    expect(req.request.params.get('name_like')).toBe('Test');
    expect(req.request.params.getAll('stars')).toEqual(['3', '4']);
    expect(req.request.params.get('rate_gte')).toBe('3.5');
    expect(req.request.params.get('price_lte')).toBe('500');
    flushMockResponse(req, mockHotels, totalItems);
  });

  it('should handle errors when fetching hotels', () => {
    const mockOptions = createDefaultOptions();
    const errorMessage = 'Server error';
    const errorStatus = 500;
    const errorStatusText = 'Internal Server Error';

    service.getHotelsWithOptions(mockOptions).subscribe({
      next: () => fail('should have failed with an error'),
      error: error => {
        expect(error instanceof Error).toBeTrue();
        expect(error.message).toContain(`Server returned code ${errorStatus}`);
        expect(error.message).toContain(errorStatusText);
      },
    });

    const req = httpMock.expectOne(`${apiUrl}?_page=1&_limit=10`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('_limit')).toBe('10');

    req.flush(errorMessage, { status: errorStatus, statusText: errorStatusText });
  });

  it('should fetch a hotel by ID', () => {
    const hotelId = '123';
    const mockHotel: Hotel = {
      id: hotelId,
      name: 'Test Hotel',
      image: 'img.jpg',
      address: 'Test Address',
      stars: 4,
      rate: 4.2,
      price: 200,
      description: 'Test Description',
    };

    service.getHotelById(hotelId).subscribe(hotel => {
      expect(hotel).toEqual(mockHotel);
    });

    const req = httpMock.expectOne(`${apiUrl}/${hotelId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockHotel);
  });

  it('should handle 404 error when fetching a hotel by ID', () => {
    const hotelId = 'non-existent-id';
    const errorStatus = 404;
    const errorStatusText = 'Not Found';
    const errorMessage = 'Hotel not found (Error 404).';

    service.getHotelById(hotelId).subscribe({
      next: () => fail('should have failed with a 404 error'),
      error: error => {
        expect(error instanceof Error).toBeTrue();
        expect(error.message).toContain(errorMessage);
      },
    });

    const req = httpMock.expectOne(`${apiUrl}/${hotelId}`);
    expect(req.request.method).toBe('GET');
    req.flush('Not Found', { status: errorStatus, statusText: errorStatusText });
  });

  it('should handle generic HTTP error when fetching a hotel by ID', () => {
    const hotelId = 'some-id';
    const errorStatus = 500;
    const errorStatusText = 'Internal Server Error';
    const errorMessage = 'Server error';

    service.getHotelById(hotelId).subscribe({
      next: () => fail('should have failed with a generic HTTP error'),
      error: error => {
        expect(error instanceof Error).toBeTrue();
        expect(error.message).toContain(`Server returned code ${errorStatus}`);
        expect(error.message).toContain(errorStatusText);
      },
    });

    const req = httpMock.expectOne(`${apiUrl}/${hotelId}`);
    expect(req.request.method).toBe('GET');
    req.flush(errorMessage, { status: errorStatus, statusText: errorStatusText });
  });

  it('should handle network error (ErrorEvent) when fetching hotels', () => {
    const mockOptions = createDefaultOptions();
    const mockErrorEvent = new ErrorEvent('Network error', {
      message: 'Simulated network error',
    });

    service.getHotelsWithOptions(mockOptions).subscribe({
      next: () => fail('should have failed with a network error'),
      error: error => {
        expect(error instanceof Error).toBeTrue();
        expect(error.message).toContain(`Error: ${mockErrorEvent.message}`);
      },
    });

    const req = httpMock.expectOne(`${apiUrl}?_page=1&_limit=10`);
    expect(req.request.method).toBe('GET');
    req.error(mockErrorEvent);
  });

  it('should not add rate_gte param if minRate is 0', () => {
    const mockOptions: GetHotelsOptions = {
      ...createDefaultOptions(),
      filters: { ...createDefaultOptions().filters, minRate: 0 },
    };
    const mockData: Hotel[] = [];
    const totalItems = 50;
    const expectedResponse = createMockResponseData(mockData, totalItems);

    service.getHotelsWithOptions(mockOptions).subscribe(response => {
      expect(response).toEqual(expectedResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}?_page=1&_limit=10`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.has('rate_gte')).toBeFalse();
    flushMockResponse(req, mockData, totalItems);
  });

  it('should not add price_lte param if maxPrice is 1000', () => {
    const mockOptions: GetHotelsOptions = {
      ...createDefaultOptions(),
      filters: { ...createDefaultOptions().filters, maxPrice: 1000 },
    };
    const mockData: Hotel[] = [];
    const totalItems = 50;
    const expectedResponse = createMockResponseData(mockData, totalItems);

    service.getHotelsWithOptions(mockOptions).subscribe(response => {
      expect(response).toEqual(expectedResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}?_page=1&_limit=10`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.has('price_lte')).toBeFalse();
    flushMockResponse(req, mockData, totalItems);
  });
});
