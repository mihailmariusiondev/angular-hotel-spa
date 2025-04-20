import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  Observable,
  switchMap,
  map,
  catchError,
  of,
  filter,
  withLatestFrom,
  shareReplay,
} from 'rxjs';
import { HotelStateService } from '../../services/hotel-state.service';
import { HotelsService } from '../../services/hotels.service';
import { Hotel } from '../../models/hotel.model';

/**
 * Component to display the detailed information of a single hotel.
 * Loads data reactively based on route parameters, checking local state first.
 */
@Component({
  selector: 'app-hotel-detail',
  standalone: true,
  imports: [CommonModule, RouterModule], // CommonModule provides async pipe
  templateUrl: './hotel-detail.component.html',
  styleUrls: ['./hotel-detail.component.scss'],
})
export class HotelDetailComponent {
  // Inject services directly using inject()
  private route = inject(ActivatedRoute);
  private hotelsService = inject(HotelsService);
  private hotelState = inject(HotelStateService);

  // Define the hotel$ observable directly as a class property
  readonly hotel$: Observable<Hotel | undefined> = this.route.paramMap.pipe(
    map(params => params.get('id')),
    filter((id): id is string => !!id),
    withLatestFrom(this.hotelState.state$),
    switchMap(([id, state]) => {
      const foundHotel = state.data.find(h => h.id === id);
      if (foundHotel) {
        return of(foundHotel);
      } else {
        return this.hotelsService.getHotelById(id).pipe(
          catchError(() => {
            return of(undefined);
          })
        );
      }
    }),
    shareReplay(1)
  );

  // Default fallback image URL
  readonly defaultImageUrl =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiA5IiBmaWxsPSIjZjVmNWY1Ij48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlZWVlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxLjVyZW0iIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjOTk5Ij5Ib3RlbCBJbWFnZTwvdGV4dD48L3N2Zz4=';

  /**
   * Generates an array for rendering star icons.
   * @param count - The number of stars (should be between 0 and 5).
   * @returns An array of numbers.
   */
  starsArray(count: number): number[] {
    const numStars = Math.max(0, Math.min(5, Math.floor(count || 0)));
    return Array(numStars).fill(0);
  }

  /**
   * Se llama cuando la imagen principal del hotel se ha cargado correctamente.
   * Elimina la clase 'image-loading' y añade 'image-loaded' para iniciar la transición.
   * @param imgElement La referencia al elemento <img>
   */
  onImageLoad(imgElement: HTMLImageElement): void {
    imgElement.classList.remove('image-loading');
    imgElement.classList.add('image-loaded'); // Añade clase 'loaded'
  }

  /**
   * Handles image loading errors by setting the image source to a default fallback image.
   * También gestiona las clases CSS para la transición.
   * @param evt - The error event.
   */
  onImageError(evt: Event): void {
    const imgElement = evt.target as HTMLImageElement;
    imgElement.src = this.defaultImageUrl;
    imgElement.classList.remove('image-loading');
    imgElement.classList.add('image-error'); // Añade clase 'error'
  }
}
