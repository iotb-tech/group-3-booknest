// js/app.ts

import { searchBooks, getBookDetails } from "./api.js";
import { getCoverUrl, isBook } from "./utils.js";
import { Book, AppState, SearchState } from "./types.js";

class BookNestApp {
  // APP STATE
  private state: AppState = {
    query: "",
    results: [],
    searchState: "idle",
    errorMessage: null,
    favorites: [],
    selectedBook: null,
  };

  // DOM REFERENCES
  private searchForm: HTMLFormElement | null = null;
  private searchInput: HTMLInputElement | null = null;
  private resultsContainer: HTMLElement | null = null;
  private loadingState: HTMLElement | null = null;
  private emptyState: HTMLElement | null = null;
  private errorState: HTMLElement | null = null;
  private detailModal: HTMLElement | null = null;
  private favoritesContainer: HTMLElement | null = null;

  // INITIALIZATION
  constructor() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.init());
    } else {
      this.init();
    }
  }

  private init(): void {
    console.log("BookNest initializing...");

    this.cacheDomElements();
    this.loadFavorites();
    this.bindEvents();
    this.render();

    console.log(
      "BookNest ready. Favorites loaded:",
      this.state.favorites.length,
    );
  }

  // DOM SETUP
  private cacheDomElements(): void {
    this.searchForm = document.getElementById(
      "search-form",
    ) as HTMLFormElement | null;
    this.searchInput = document.getElementById(
      "search-input",
    ) as HTMLInputElement | null;
    this.resultsContainer = document.getElementById("results-container");
    this.loadingState = document.getElementById("loading-state");
    this.emptyState = document.getElementById("empty-state");
    this.errorState = document.getElementById("error-state");
    this.detailModal = document.getElementById("detail-modal");
    this.favoritesContainer = document.getElementById("favorites-container");
  }

  // Attach event listeners to DOM elements
  private bindEvents(): void {
    this.searchForm?.addEventListener("submit", (e: Event) => {
      e.preventDefault();
      this.handleSearch();
    });

    this.detailModal?.addEventListener("click", (e: Event) => {
      if (e.target === this.detailModal) {
        this.closeDetailView();
      }
    });

    document.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Escape" && this.state.selectedBook) {
        this.closeDetailView();
      }
    });
  }

  // SEARCH LOGIC

  // Handles the search action.
  private async handleSearch(): Promise<void> {
    const query = this.searchInput?.value?.trim();

    if (!query) {
      return;
    }

    this.state.query = query;
    this.state.searchState = "loading";
    this.state.errorMessage = null;
    this.state.results = [];
    this.render();

    try {
      const books: Book[] = await searchBooks(query);

      if (books.length === 0) {
        this.state.searchState = "empty";
        this.state.results = [];
      } else {
        this.state.searchState = "success";
        this.state.results = books;
      }
    } catch (error) {
      this.state.searchState = "error";
      this.state.errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      this.state.results = [];
    }

    this.render();
  }

  // DETAIL VIEW LOGIC

  // Opens the detail view for a specific book.
  async openDetailView(bookId: string): Promise<void> {
    const bookFromResults = this.state.results.find((b) => b.id === bookId);

    if (!bookFromResults) {
      console.warn("Book not found in results:", bookId);
      return;
    }

    let book: Book = { ...bookFromResults };

    try {
      const details = await getBookDetails(bookId);

      if (details.description) {
        book.description = details.description;
      }
      if (details.subjects && details.subjects.length > 0) {
        book.subjects = details.subjects;
      }
    } catch {
      console.log("Could not fetch extra details, using search data only");
    }

    this.state.selectedBook = book;
    this.renderDetailModal();
  }

  // Closes the detail view modal.
  closeDetailView(): void {
    this.state.selectedBook = null;
    this.renderDetailModal();
  }

  // FAVORITES LOGIC

  // Toggles a book's favorite status.
  toggleFavorite(book: Book): void {
    const index = this.state.favorites.findIndex((f) => f.id === book.id);

    if (index === -1) {
      this.state.favorites.push(book);
    } else {
      this.state.favorites.splice(index, 1);
    }

    this.saveFavorites();
    this.render();
  }

  // Checks if a book is in the favorites list.
  isFavorite(bookId: string): boolean {
    return this.state.favorites.some((f) => f.id === bookId);
  }

  // Loads favorites from localStorage.
  private loadFavorites(): void {
    try {
      const stored = localStorage.getItem("booknest-favorites");

      if (!stored) {
        this.state.favorites = [];
        return;
      }

      const parsed: unknown = JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        console.warn("Favorites data is not an array, resetting");
        this.state.favorites = [];
        return;
      }

      const validBooks = parsed.filter(isBook);

      if (validBooks.length !== parsed.length) {
        console.warn(
          `Filtered out ${parsed.length - validBooks.length} invalid favorites`,
        );
      }

      this.state.favorites = validBooks;
    } catch (error) {
      console.error("Failed to load favorites:", error);
      this.state.favorites = [];
    }
  }

  // Saves favorites to localStorage.
  private saveFavorites(): void {
    try {
      const json = JSON.stringify(this.state.favorites);
      localStorage.setItem("booknest-favorites", json);
    } catch (error) {
      console.error("Failed to save favorites:", error);
    }
  }

  // ============================================================
  // RENDERING
  // ============================================================

  // Main render method, updates the entire UI.
  private render(): void {
    this.renderSearchResults();
    this.renderFavorites();
  }

  // Renders the search results area based on current state.
  private renderSearchResults(): void {
    // Hide all state containers first
    this.hideElement(this.loadingState);
    this.hideElement(this.emptyState);
    this.hideElement(this.errorState);
    this.hideElement(this.resultsContainer);

    // Show the appropriate container based on state
    switch (this.state.searchState) {
      case "idle":
        break;

      case "loading":
        this.showElement(this.loadingState);
        break;

      case "empty":
        this.showElement(this.emptyState);
        break;

      case "error":
        this.showElement(this.errorState);
        if (this.errorState && this.state.errorMessage) {
          // Find the error message element inside the error state container
          const msgEl = this.errorState.querySelector("[data-error-message]");
          if (msgEl) {
            msgEl.textContent = this.state.errorMessage;
          }
        }
        break;

      case "success":
        this.showElement(this.resultsContainer);
        this.renderBookCards();
        break;
    }
  }

  // Renders book cards into the results container.
  private renderBookCards(): void {
    if (!this.resultsContainer) return;

    // Build HTML for all book cards
    const cardsHtml = this.state.results
      .map((book) => this.createBookCardHtml(book))
      .join("");

    // Find the grid container inside results
    const grid = this.resultsContainer.querySelector("[data-results-grid]");
    if (grid) {
      grid.innerHTML = cardsHtml;

      // Attach click handlers to the newly created cards
      grid.querySelectorAll("[data-book-card]").forEach((card) => {
        const bookId = (card as HTMLElement).dataset.bookId;
        if (bookId) {
          card.addEventListener("click", () => this.openDetailView(bookId));
        }
      });
    }
  }

  // Creates the HTML string for a single book card.
  private createBookCardHtml(book: Book): string {
    const coverUrl = getCoverUrl(book.coverId, "M");
    const isFav = this.isFavorite(book.id);

    return `
      <div 
        class="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer card-hover"
        data-book-card
        data-book-id="${book.id}"
      >
        <div class="h-64 bg-sage flex items-center justify-center">
          <img 
            src="${coverUrl}" 
            alt="Cover of ${book.title}"
            class="h-full w-full object-cover"
            loading="lazy"
            onerror="this.src='assets/placeholder-cover.png'"
          >
        </div>
        <div class="p-4">
          <h3 class="font-display font-bold text-lg text-oxblood mb-1 truncate">
            ${book.title}
          </h3>
          <p class="text-warm-gray text-sm mb-2">${book.author}</p>
          <div class="flex items-center justify-between">
            <span class="text-xs text-warm-gray">${book.firstPublishYear}</span>
            <button 
              class="text-sm ${isFav ? "text-oxblood" : "text-warm-gray"} hover:text-oxblood transition-colors"
              data-favorite-btn
              data-book-id="${book.id}"
              aria-label="${isFav ? "Remove from favorites" : "Add to favorites"}"
            >
              ${isFav ? "♥" : "♡"}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Render the detail modal with the selected book's information.
  private renderDetailModal(): void {
    if (!this.detailModal) return;

    if (!this.state.selectedBook) {
      this.detailModal.classList.add("hidden");
      return;
    }

    const book = this.state.selectedBook;
    const coverUrl = getCoverUrl(book.coverId, "L");
    const isFav = this.isFavorite(book.id);

    // Build modal content
    this.detailModal.innerHTML = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="flex flex-col md:flex-row">
            <!-- Book cover -->
            <div class="md:w-1/3 bg-sage flex items-center justify-center p-4">
              <img 
                src="${coverUrl}" 
                alt="Cover of ${book.title}"
                class="w-full max-w-[200px] rounded shadow-lg"
                onerror="this.src='assets/placeholder-cover.png'"
              >
            </div>
            <!-- Book details -->
            <div class="md:w-2/3 p-6">
              <div class="flex justify-between items-start mb-4">
                <h2 class="font-display text-2xl font-bold text-oxblood">${book.title}</h2>
                <button 
                  class="text-2xl ${isFav ? "text-oxblood" : "text-warm-gray"} hover:text-oxblood transition-colors"
                  data-detail-favorite-btn
                  aria-label="${isFav ? "Remove from favorites" : "Add to favorites"}"
                >
                  ${isFav ? "♥" : "♡"}
                </button>
              </div>
              <p class="text-warm-gray mb-4">By ${book.author}</p>
              ${book.firstPublishYear ? `<p class="text-sm text-warm-gray mb-4">First published: ${book.firstPublishYear}</p>` : ""}
              ${
                book.description
                  ? `
                <div class="mb-4">
                  <h3 class="font-semibold text-ink mb-2">Description</h3>
                  <p class="text-ink text-sm leading-relaxed">${book.description}</p>
                </div>
              `
                  : ""
              }
              ${
                book.subjects && book.subjects.length > 0
                  ? `
                <div>
                  <h3 class="font-semibold text-ink mb-2">Subjects</h3>
                  <div class="flex flex-wrap gap-2">
                    ${book.subjects.map((s) => `<span class="bg-parchment text-ink text-xs px-2 py-1 rounded">${s}</span>`).join("")}
                  </div>
                </div>
              `
                  : ""
              }
            </div>
          </div>
          <!-- Close button -->
          <button 
            class="absolute top-4 right-4 text-warm-gray hover:text-ink text-2xl"
            data-close-modal
            aria-label="Close detail view"
          >
            ×
          </button>
        </div>
      </div>
    `;

    // Show the modal
    this.detailModal.classList.remove("hidden");

    // Attach event listeners to the new modal content
    const closeBtn = this.detailModal.querySelector("[data-close-modal]");
    closeBtn?.addEventListener("click", () => this.closeDetailView());

    const favBtn = this.detailModal.querySelector("[data-detail-favorite-btn]");
    favBtn?.addEventListener("click", () => {
      if (this.state.selectedBook) {
        this.toggleFavorite(this.state.selectedBook);
        this.renderDetailModal();
      }
    });
  }

  // Render the favorites section.
  private renderFavorites(): void {
    if (!this.favoritesContainer) return;

    if (this.state.favorites.length === 0) {
      this.favoritesContainer.innerHTML = `
        <p class="text-warm-gray text-center py-4">No favorites yet. Start exploring books!</p>
      `;
      return;
    }

    const coversHtml = this.state.favorites
      .map((book) => {
        const coverUrl = getCoverUrl(book.coverId, "S");
        return `
        <div 
          class="flex-shrink-0 w-16 h-24 cursor-pointer"
          data-book-id="${book.id}"
          title="${book.title}"
        >
          <img 
            src="${coverUrl}" 
            alt="${book.title}"
            class="w-full h-full object-cover rounded"
            onerror="this.src='assets/placeholder-cover.png'"
          >
        </div>
      `;
      })
      .join("");

    this.favoritesContainer.innerHTML = `
      <div class="flex gap-2 overflow-x-auto pb-2" data-favorites-list>
        ${coversHtml}
      </div>
    `;

    // Attach click handlers to favorite covers
    this.favoritesContainer.querySelectorAll("[data-book-id]").forEach((el) => {
      const bookId = (el as HTMLElement).dataset.bookId;
      if (bookId) {
        el.addEventListener("click", () => this.openDetailView(bookId));
      }
    });
  }

  // DOM HELPERS

  private showElement(el: HTMLElement | null): void {
    if (el) el.classList.remove("hidden");
  }

  private hideElement(el: HTMLElement | null): void {
    if (el) el.classList.add("hidden");
  }
}

const app = new BookNestApp();
export default app;
