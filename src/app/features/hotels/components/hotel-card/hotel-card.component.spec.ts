import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HotelCardComponent } from './hotel-card.component';
import { Hotel } from '../../models/hotel.model';
import { CurrencyPipe } from '@angular/common';

describe('HotelCardComponent', () => {
  let component: HotelCardComponent;
  let fixture: ComponentFixture<HotelCardComponent>;

  const mockHotel: Hotel = {
    id: '1',
    name: 'Test Hotel',
    image: 'test.jpg',
    address: 'Test Address',
    stars: 4,
    rate: 4.5,
    price: 22,
    description: 'Description 1',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelCardComponent],
      providers: [CurrencyPipe],
    }).compileComponents();

    fixture = TestBed.createComponent(HotelCardComponent);
    component = fixture.componentInstance;
    component.hotel = mockHotel;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have required hotel input', () => {
    expect(component.hotel).toEqual(mockHotel);
  });

  it('should generate correct stars array', () => {
    expect(component.starsArray.length).toBe(4);
    expect(component.starsArray.every(star => star === 0)).toBeTrue();
  });

  it('should render hotel data correctly', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h5').textContent).toContain(mockHotel.name);
    expect(compiled.querySelector('.card-text').textContent).toContain(mockHotel.address);
    expect(compiled.querySelector('.price').textContent).toContain('€22.00');
  });

  it('should display correct number of star icons', () => {
    const stars = fixture.nativeElement.querySelectorAll('.bi-star-fill');
    expect(stars.length).toBe(mockHotel.stars);
  });

  it('should show default image on error', () => {
    const img = fixture.nativeElement.querySelector('img');
    img.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(img.src).toBe(component.defaultImageUrl);
  });

  it('should handle image error', () => {
    const imgElement = document.createElement('img');
    const event = { target: imgElement } as unknown as Event;
    component.onImageError(event);
    expect(imgElement.src).toBe(component.defaultImageUrl);
  });
});
