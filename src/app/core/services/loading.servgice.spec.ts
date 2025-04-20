import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [LoadingService] });
    service = TestBed.inject(LoadingService);
  });

  it('should start hidden', done => {
    service.loading$.subscribe(val => {
      expect(val).toBeFalse();
      done();
    });
  });

  it('show() should emit true immediately on first call', done => {
    service.loading$.pipe().subscribe(val => {
      if (val) {
        expect(val).toBeTrue();
        done();
      }
    });
    service.show();
  });

  it('multiple show() calls should not emit multiple true', fakeAsync(() => {
    let count = 0;
    service.loading$.subscribe(val => {
      if (val) count++;
    });
    service.show();
    service.show();
    tick();
    expect(count).toBe(1);
  }));

  it('hide() before MIN_DISPLAY_TIME should delay false', fakeAsync(() => {
    const states: boolean[] = [];
    service.show();
    service.loading$.subscribe(val => states.push(val));
    service.hide();
    tick(service['MIN_DISPLAY_TIME'] - 100);
    expect(states).toEqual([true]);
    tick(100);
    expect(states).toEqual([true, false]);
  }));

  it('hide() after MIN_DISPLAY_TIME should emit false immediately', fakeAsync(() => {
    const states: boolean[] = [];
    service.show();
    // simulate time past MIN
    service['loadingStartTime'] = Date.now() - service['MIN_DISPLAY_TIME'] - 10;
    service.loading$.subscribe(val => states.push(val));
    service.hide();
    tick();
    expect(states).toEqual([true, false]);
  }));

  it('concurrent requests should keep loading until all hide()', fakeAsync(() => {
    const states: boolean[] = [];
    service.loading$.subscribe(val => states.push(val));
    service.show();
    service.show();
    service.hide();
    tick(service['MIN_DISPLAY_TIME']);
    expect(states).toEqual([false, true]);
    service.hide();
    tick();
    expect(states).toEqual([false, true, false]);
  }));
});
