import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpHandlerFn, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

/**
 * Interceptor para mostrar y ocultar un spinner de carga durante las peticiones HTTP.
 */
export const loadingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const loadingService = inject(LoadingService);

  // Show loader before request starts
  loadingService.show();

  return next(req).pipe(
    // Hide loader when response is received (success or error)
    finalize(() => {
      loadingService.hide();
    })
  );
};
