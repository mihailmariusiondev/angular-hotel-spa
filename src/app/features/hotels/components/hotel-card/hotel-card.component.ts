import { Component, Input } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Hotel } from '../../models/hotel.model';

/**
 * Component to display a single hotel card with its details.
 */
@Component({
  selector: 'app-hotel-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './hotel-card.component.html',
  styleUrls: ['./hotel-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelCardComponent {
  /** The hotel data to display. */
  @Input({ required: true }) hotel!: Hotel;

  // Responsive SVG fallback image (aspect ratio maintained by the container)
  defaultImageUrl =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiA5IiBmaWxsPSIjZjVmNWY1Ij48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlZWVlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxLjVyZW0iIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjOTk5Ij5Ib3RlbCBJbWFnZTwvdGV4dD48L3N2Zz4=';

  /**
   * Handles image loading errors by setting the image source to a default fallback image.
   * @param event - The error event.
   */
  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = this.defaultImageUrl;
  }

  /**
   * Returns an array of numbers equal to the number of stars of the hotel.
   * Used for rendering star icons in the template.
   */
  get starsArray(): number[] {
    return Array(this.hotel.stars).fill(0);
  }
}
