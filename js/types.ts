// Internal representation of a book
export interface Book {
  id: string;
  title: string;
  author: string;
  coverId: number | null;
  firstPublishYear: number | string;
  editionCount?: number;
  subjects?: string[];
  description?: string;
}

// ============================================================
// API RESPONSE SHAPES
// ============================================================

// The top-level response from Open Library's /search.json endpoint.
export interface OpenLibrarySearchResponse {
  numFound: number;
  start: number;
  docs: OpenLibraryDoc[];
}

// A single document inside the .docs array
export interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  edition_count?: number;
  subject?: string[];
  first_sentence?: string[];
}

// SEARCH STATE to control what our displays
export type SearchState = "idle" | "loading" | "success" | "empty" | "error";

// APP STATE for every piece of data the app tracks
export interface AppState {
  query: string;
  results: Book[];
  searchState: SearchState;
  errorMessage: string | null;
  favorites: Book[];
  selectedBook: Book | null;
  isFavoritesPanelOpen: boolean;
}
