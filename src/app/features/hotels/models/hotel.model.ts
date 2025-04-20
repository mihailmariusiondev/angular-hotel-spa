// --- Main Entity ---
export interface Hotel {
  id: string;
  name: string;
  image: string;
  address: string;
  stars: number;
  rate: number;
  price: number;
  description: string; // <--- ADDED
}

// --- Filter State ---
export interface FilterState {
  name: string;
  selectedStars: number[];
  minRate: number;
  maxPrice: number;
}

// --- Sort State ---
export interface SortState {
  sortBy: 'price' | 'rate' | 'stars' | 'name' | null;
  sortDirection: 'asc' | 'desc';
}

// --- Pagination State (Client-side) ---
export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

// --- Options for Service Request ---
export interface GetHotelsOptions {
  filters: FilterState;
  sort: SortState;
  pagination: PaginationState;
}

// --- Global Module State ---
export interface HotelsState {
  data: Hotel[];
  filters: FilterState;
  sort: SortState;
  pagination: PaginationState;
}

// --- Constants ---
/** Available options for items per page */
export const AVAILABLE_PAGE_SIZES: number[] = [9, 18, 27, 36]; // Add or adjust as needed
