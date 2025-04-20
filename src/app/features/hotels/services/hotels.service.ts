import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Hotel, GetHotelsOptions } from '../models/hotel.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HotelsService {
  private apiUrl = `${environment.apiUrl}/hotels`;
  private http = inject(HttpClient);

  getHotelsWithOptions(options: GetHotelsOptions): Observable<{
    data: Hotel[];
    totalItems: number;
  }> {
    let params = new HttpParams()
      .set('_page', options.pagination.currentPage.toString())
      .set('_limit', options.pagination.pageSize.toString());

    if (options.sort.sortBy) {
      params = params.set('_sort', options.sort.sortBy).set('_order', options.sort.sortDirection);
    }
    if (options.filters.name) {
      params = params.set('name_like', options.filters.name);
    }
    options.filters.selectedStars.forEach(star => {
      params = params.append('stars', star.toString());
    });
    if (options.filters.minRate > 0) {
      params = params.set('rate_gte', options.filters.minRate.toString());
    }
    if (options.filters.maxPrice < 1000) {
      params = params.set('price_lte', options.filters.maxPrice.toString());
    }

    return this.http.get<Hotel[]>(this.apiUrl, { params, observe: 'response' }).pipe(
      map((res: HttpResponse<Hotel[]>) => {
        const data = res.body || [];
        const total = Number(res.headers.get('X-Total-Count')) || 0;
        return { data, totalItems: total };
      }),
      catchError(this.handleError)
    );
  }

  getHotelById(id: string): Observable<Hotel> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Hotel>(url).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Server returned code ${error.status}, error message is: ${error.message}`;
      if (error.status === 404) {
        errorMessage = `Hotel not found (Error 404).`;
      }
    }
    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
