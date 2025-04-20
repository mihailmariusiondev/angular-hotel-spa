import type { Routes } from '@angular/router';

export const hotelsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/hotel-list/hotel-list.component').then(m => m.HotelsListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/hotel-detail/hotel-detail.component').then(m => m.HotelDetailComponent),
  },
];
