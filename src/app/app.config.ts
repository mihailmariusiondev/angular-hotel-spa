import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Provides the necessary services for routing based on the defined routes.
    provideRouter(routes),
    // Provides the HttpClient service and registers the loading interceptor.
    provideHttpClient(withInterceptors([loadingInterceptor])),
  ],
};
