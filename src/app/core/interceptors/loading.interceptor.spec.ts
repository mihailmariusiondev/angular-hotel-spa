import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { loadingInterceptor } from './loading.interceptor';
import { LoadingService } from '../services/loading.service';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

describe('loadingInterceptor', () => {
  let loadingService: LoadingService;
  let req: HttpRequest<unknown>;
  let next: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [LoadingService] });
    loadingService = TestBed.inject(LoadingService);
    req = new HttpRequest('GET', '/test');
    next = jasmine.createSpy('next').and.returnValue(of(new HttpResponse()));
  });

  // Should call show() and hide() on successful response
  it('should call show and hide on success', fakeAsync(() => {
    spyOn(loadingService, 'show');
    spyOn(loadingService, 'hide');
    TestBed.runInInjectionContext(() => loadingInterceptor(req, next).subscribe());
    expect(loadingService.show).toHaveBeenCalled();
    tick(0);
    expect(loadingService.hide).toHaveBeenCalled();
  }));

  // Should call hide() even if request errors
  it('should call hide on error', fakeAsync(() => {
    next.and.returnValue(throwError(() => new Error()));
    spyOn(loadingService, 'hide');
    TestBed.runInInjectionContext(() =>
      loadingInterceptor(req, next).subscribe({ error: () => {} })
    );
    tick(0);
    expect(loadingService.hide).toHaveBeenCalled();
  }));
});
