import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HotelSortComponent } from './hotel-sort.component';
import { HotelStateService } from '../../services/hotel-state.service';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { SortState } from '../../models/hotel.model';

describe('HotelSortComponent', () => {
  let component: HotelSortComponent;
  let fixture: ComponentFixture<HotelSortComponent>;
  let hotelStateServiceSpy: jasmine.SpyObj<HotelStateService>;

  const initialSortState: SortState = {
    sortBy: null,
    sortDirection: 'asc',
  };

  const sortStateSubject = new BehaviorSubject<SortState>(initialSortState);

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('HotelStateService', ['updateSort'], {
      sortState$: sortStateSubject.asObservable(),
    });

    await TestBed.configureTestingModule({
      imports: [HotelSortComponent, FormsModule],
      providers: [{ provide: HotelStateService, useValue: spy }],
    }).compileComponents();

    hotelStateServiceSpy = TestBed.inject(HotelStateService) as jasmine.SpyObj<HotelStateService>;
    fixture = TestBed.createComponent(HotelSortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have sort options defined', () => {
    expect(component.sortOptions.length).toBe(8);

    // Check that options include common sort methods
    expect(component.sortOptions.some(option => option.value === 'price,asc')).toBeTrue();
    expect(component.sortOptions.some(option => option.value === 'name,asc')).toBeTrue();
    expect(component.sortOptions.some(option => option.value === 'stars,desc')).toBeTrue();
  });

  it('should default to empty selected sort', () => {
    expect(component.selectedSort).toBe('');
  });

  it('should update sort when selection changes to a valid option', () => {
    component.selectedSort = 'price,asc';
    component.onSortChange();

    expect(hotelStateServiceSpy.updateSort).toHaveBeenCalledWith('price', 'asc');
  });

  it('should update sort when selection changes to another valid option', () => {
    component.selectedSort = 'name,desc';
    component.onSortChange();

    expect(hotelStateServiceSpy.updateSort).toHaveBeenCalledWith('name', 'desc');
  });

  it('should handle empty selection', () => {
    component.selectedSort = '';
    component.onSortChange();

    expect(hotelStateServiceSpy.updateSort).toHaveBeenCalledWith(null, 'asc');
  });

  it('should parse sortBy and sortDirection correctly', () => {
    // Test with stars,desc
    component.selectedSort = 'stars,desc';
    component.onSortChange();

    expect(hotelStateServiceSpy.updateSort).toHaveBeenCalledWith('stars', 'desc');

    // Test with rate,asc
    component.selectedSort = 'rate,asc';
    component.onSortChange();

    expect(hotelStateServiceSpy.updateSort).toHaveBeenCalledWith('rate', 'asc');
  });
});
