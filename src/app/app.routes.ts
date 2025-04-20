import type { Routes } from '@angular/router';

/**
 * Main application routes.
 * Defines the top-level routes for the application.
 */
export const routes: Routes = [
  // Redirects the root path to /hotels
  { path: '', redirectTo: 'hotels', pathMatch: 'full' },

  // Lazy loads all hotel-related routes
  {
    path: 'hotels',
    loadChildren: () => import('./features/hotels/hotels.routes').then(m => m.hotelsRoutes),
  },

  // Wildcard route for a 404 Not Found page
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
];
