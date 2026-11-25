import { Routes } from '@angular/router';

export const TRAVEL_REQUEST_ROUTES: Routes = [
  {
    path: '',
    title: 'Travel Requests — TMS Portal',
    loadComponent: () =>
      import('./travel-requests-list-page').then((m) => m.TravelRequestsListPage),
  },
  {
    path: 'new',
    title: 'New Travel Request — TMS Portal',
    loadComponent: () =>
      import('./travel-request-form-page').then((m) => m.TravelRequestFormPage),
  },
  {
    path: ':id',
    title: 'Travel Request Details — TMS Portal',
    loadComponent: () =>
      import('./travel-request-detail-page').then((m) => m.TravelRequestDetailPage),
  },
  {
    path: ':id/edit',
    title: 'Edit Travel Request — TMS Portal',
    loadComponent: () =>
      import('./travel-request-form-page').then((m) => m.TravelRequestFormPage),
  },
];
