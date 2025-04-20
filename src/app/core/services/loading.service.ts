import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';

/**
 * Service to manage the state of a loading spinner.
 * It keeps track of active requests and ensures the spinner is displayed
 * for a minimum amount of time to prevent flickering.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  // Subject to emit the loading state (true when loading, false otherwise)
  private loadingSubject = new BehaviorSubject<boolean>(false);
  // Counter to track the number of active requests
  private requestCounter = 0;
  // Timestamp when the loading spinner was first shown
  private loadingStartTime: number | null = null;
  // Minimum time in milliseconds the loading spinner should be displayed
  private readonly MIN_DISPLAY_TIME = 800; // Minimum display time in ms

  // Observable that components can subscribe to to get the current loading state
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  /**
   * Increments the request counter and shows the loading spinner
   * if it's the first active request.
   */
  show(): void {
    this.requestCounter++;
    if (this.requestCounter === 1) {
      // Start loading only on the first request
      this.loadingStartTime = Date.now();
      this.loadingSubject.next(true);
    }
  }

  /**
   * Decrements the request counter and hides the loading spinner
   * if there are no more active requests and the minimum display time has passed.
   */
  hide(): void {
    if (this.requestCounter > 0) {
      this.requestCounter--;
    }

    // Only hide if the counter is zero and loading actually started
    if (this.requestCounter === 0 && this.loadingStartTime !== null) {
      const elapsed = Date.now() - this.loadingStartTime;
      const remaining = this.MIN_DISPLAY_TIME - elapsed;

      if (remaining > 0) {
        // Wait for the minimum display time before hiding
        timer(remaining).subscribe(() => {
          // Double-check counter in case a new request came in while waiting
          if (this.requestCounter === 0) {
            this.loadingSubject.next(false);
            this.loadingStartTime = null;
          }
        });
      } else {
        // Minimum time already passed, hide immediately
        this.loadingSubject.next(false);
        this.loadingStartTime = null;
      }
    } else if (this.requestCounter === 0) {
      // Ensure it's hidden if counter is somehow 0 but start time wasn't set
      this.loadingSubject.next(false);
      this.loadingStartTime = null;
    }
  }
}
