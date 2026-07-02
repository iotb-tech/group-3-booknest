import { Book } from "./types.js";
import { isBook } from "./utils.js";

const STORAGE_KEY = "booknest-favorites";

// ========== LOCAL STORAGE ==========

// Load favorites from localStorage
export function loadFavorites(): Book[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      console.warn("Favorites data is not an array, resetting");
      return [];
    }

    const validBooks = parsed.filter(isBook);

    if (validBooks.length !== parsed.length) {
      console.warn(
        `Filtered out ${parsed.length - validBooks.length} invalid favorites`,
      );
    }

    return validBooks;
  } catch (error) {
    console.error("Failed to load favorites:", error);
    return [];
  }
}

// Save favorites to localStorage
export function saveFavorites(favorites: Book[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error("Failed to save favorites:", error);
  }
}

// ========== FAVORITE OPERATIONS ==========

// Toggle a book's presence in the favorites array
export function toggleFavorite(favorites: Book[], book: Book): Book[] {
  const index = favorites.findIndex((f) => f.id === book.id);

  if (index === -1) {
    return [...favorites, book];
  } else {
    return favorites.filter((f) => f.id !== book.id);
  }
}

// Check if a book ID exists in the favorites array
export function isFavorite(favorites: Book[], bookId: string): boolean {
  return favorites.some((f) => f.id === bookId);
}
