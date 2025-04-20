import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingSpinnerComponent } from '@app/shared/components/loading-spinner/loading-spinner.component';
import { LoadingService } from '@app/core/services/loading.service';
import { BehaviorSubject } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('LoadingSpinnerComponent', () => {
  let component: LoadingSpinnerComponent;
  let fixture: ComponentFixture<LoadingSpinnerComponent>;
  let mockLoadingService: {
    loading$: BehaviorSubject<boolean>;
  };

  beforeEach(async () => {
    mockLoadingService = {
      loading$: new BehaviorSubject<boolean>(false),
    };

    await TestBed.configureTestingModule({
      imports: [LoadingSpinnerComponent],
      providers: [{ provide: LoadingService, useValue: mockLoadingService }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show spinner when loading is true', () => {
    mockLoadingService.loading$.next(true);
    fixture.detectChanges();

    const spinner = fixture.debugElement.query(By.css('.spinner-border'));
    expect(spinner).toBeTruthy();
    expect(spinner.nativeElement.classList).toContain('text-primary');
  });

  it('should hide spinner when loading is false', () => {
    mockLoadingService.loading$.next(false);
    fixture.detectChanges();

    const spinner = fixture.debugElement.query(By.css('.spinner-border'));
    expect(spinner).toBeNull();
  });

  it('should have accessible loading text', () => {
    mockLoadingService.loading$.next(true);
    fixture.detectChanges();

    const statusText = fixture.debugElement.query(By.css('.visually-hidden'));
    expect(statusText.nativeElement.textContent).toContain('Cargando...');
  });
});
