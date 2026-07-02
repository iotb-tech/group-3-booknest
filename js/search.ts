import { searchBooks } from "./api.js";
import { Book, SearchState } from "./types.js";

export interface SearchResult {
  results: Book[];
  searchState: SearchState;
  errorMessage: string | null;
}

export async function performSearch(query: string): Promise<SearchResult> {
  if (!query.trim()) {
    return {
      results: [],
      searchState: "idle",
      errorMessage: null,
    };
  }

  try {
    const books: Book[] = await searchBooks(query);

    if (books.length === 0) {
      return {
        results: [],
        searchState: "empty",
        errorMessage: null,
      };
    }

    return {
      results: books,
      searchState: "success",
      errorMessage: null,
    };
  } catch (error) {
    return {
      results: [],
      searchState: "error",
      errorMessage:
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}
