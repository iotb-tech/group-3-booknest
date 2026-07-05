import { Book, AppState } from "./types.js";
import { performSearch } from "./search.js";
import {
  loadFavorites,
  saveFavorites,
  toggleFavorite,
  isFavorite,
} from "./favorites.js";
import { prepareBookForDetail } from "./detail.js";
import { showElement, hideElement } from "./dom.js";
import {
  createBookCardHtml,
  createDetailModalHtml,
  createFavoritesListHtml,
  createFavoritesPanelHtml,
} from "./templates.js";
import { isBook, getCoverUrl } from "./utils.js";

class BookNestApp {
  // ========== STATE ==========
  private state: AppState = {
    query: "",
    results: [],
    searchState: "idle",
    errorMessage: null,
    favorites: [],
    selectedBook: null,
    isFavoritesPanelOpen: false,
  };

  // ========== DOM REFERENCES ==========
  private searchForm: HTMLFormElement | null = null;
  private searchInput: HTMLInputElement | null = null;
  private resultsContainer: HTMLElement | null = null;
  private loadingState: HTMLElement | null = null;
  private emptyState: HTMLElement | null = null;
  private errorState: HTMLElement | null = null;
  private detailModal: HTMLElement | null = null;
  private favoritesContainer: HTMLElement | null = null;
  private favoritesToggle: HTMLButtonElement | null = null;
  private favoritesPanel: HTMLElement | null = null;
  private favoritesPanelContent: HTMLElement | null = null;
  private favoritesBackdrop: HTMLElement | null = null;
  private favoritesPanelClose: HTMLButtonElement | null = null;
  private favoritesCount: HTMLElement | null = null;

  // ========== INITIALIZATION ==========
  constructor() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.init());
    } else {
      this.init();
    }
  }

  private init(): void {
    this.cacheDomElements();
    this.state.favorites = loadFavorites();
    this.updateFavoritesCount();
    this.bindEvents();
    this.render();
  }

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
    this.favoritesToggle = document.getElementById(
      "favorites-toggle",
    ) as HTMLButtonElement | null;
    this.favoritesPanel = document.getElementById("favorites-panel");
    this.favoritesPanelContent = document.getElementById(
      "favorites-panel-content",
    );
    this.favoritesBackdrop = document.getElementById("favorites-backdrop");
    this.favoritesPanelClose = document.getElementById(
      "favorites-panel-close",
    ) as HTMLButtonElement | null;
    this.favoritesCount = document.getElementById("favorites-count");
  }

  private bindEvents(): void {
    this.searchForm?.addEventListener("submit", (e: Event) => {
      e.preventDefault();
      this.handleSearch();
    });

    document.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Escape" && this.state.selectedBook) {
        this.closeDetailView();
      }
    });

    this.favoritesToggle?.addEventListener("click", () => {
      this.toggleFavoritesPanel();
    });

    this.favoritesPanelClose?.addEventListener("click", () => {
      this.closeFavoritesPanel();
    });

    this.favoritesBackdrop?.addEventListener("click", () => {
      this.closeFavoritesPanel();
    });
  }

  // ========== SEARCH ==========
  private async handleSearch(): Promise<void> {
    const query = this.searchInput?.value?.trim();
    if (!query) return;

    this.state.query = query;
    this.state.searchState = "loading";
    this.state.errorMessage = null;
    this.state.results = [];
    this.render();

    const result = await performSearch(query);

    this.state.searchState = result.searchState;
    this.state.results = result.results;
    this.state.errorMessage = result.errorMessage;
    this.render();
  }

  // ========== DETAIL VIEW ==========
  async openDetailView(bookId: string): Promise<void> {
    const book = await prepareBookForDetail(bookId, this.state.results);

    if (!book) return;

    this.state.selectedBook = book;
    this.renderDetailModal();
  }

  closeDetailView(): void {
    this.state.selectedBook = null;
    this.renderDetailModal();
  }

  // ========== FAVORITES ==========
  handleToggleFavorite(book: Book): void {
    this.state.favorites = toggleFavorite(this.state.favorites, book);
    saveFavorites(this.state.favorites);
    this.updateFavoritesCount();
    this.render();
  }

  isBookFavorite(bookId: string): boolean {
    return isFavorite(this.state.favorites, bookId);
  }

  // ========== FAVORITES PANEL ==========

  private toggleFavoritesPanel(): void {
    if (this.state.isFavoritesPanelOpen) {
      this.closeFavoritesPanel();
    } else {
      this.openFavoritesPanel();
    }
  }

  private openFavoritesPanel(): void {
    this.state.isFavoritesPanelOpen = true;

    this.favoritesBackdrop?.classList.remove("hidden");

    this.favoritesPanel?.classList.remove("translate-x-full");

    this.renderFavoritesPanelContent();
  }

  private closeFavoritesPanel(): void {
    this.state.isFavoritesPanelOpen = false;

    this.favoritesBackdrop?.classList.add("hidden");

    this.favoritesPanel?.classList.add("translate-x-full");
  }

  private renderFavoritesPanelContent(): void {
    if (!this.favoritesPanelContent) return;

    this.favoritesPanelContent.innerHTML = createFavoritesPanelHtml(
      this.state.favorites,
    );

    this.favoritesPanelContent
      .querySelectorAll("[data-panel-unfavorite]")
      .forEach((btn) => {
        const bookId = (btn as HTMLElement).dataset.panelUnfavorite;
        if (!bookId) return;

        btn.addEventListener("click", () => {
          const book = this.state.favorites.find((b) => b.id === bookId);
          if (book) {
            this.handleToggleFavorite(book);

            this.renderFavoritesPanelContent();

            if (this.state.favorites.length === 0) {
              this.closeFavoritesPanel();
            }
          }
        });
      });
  }

  private updateFavoritesCount(): void {
    if (this.favoritesCount) {
      this.favoritesCount.textContent = String(this.state.favorites.length);
    }
  }

  // ========== RENDERING ==========
  private render(): void {
    this.renderSearchResults();
    this.renderFavorites();
  }

  private renderSearchResults(): void {
    hideElement(this.loadingState);
    hideElement(this.emptyState);
    hideElement(this.errorState);
    hideElement(this.resultsContainer);

    switch (this.state.searchState) {
      case "idle":
        break;
      case "loading":
        showElement(this.loadingState);
        break;
      case "empty":
        showElement(this.emptyState);
        break;
      case "error":
        showElement(this.errorState);
        if (this.errorState && this.state.errorMessage) {
          const msgEl = this.errorState.querySelector("[data-error-message]");
          if (msgEl) msgEl.textContent = this.state.errorMessage;
        }
        break;
      case "success":
        showElement(this.resultsContainer);
        this.renderBookCards();
        break;
    }
  }

  private renderBookCards(): void {
    if (!this.resultsContainer) return;

    const cardsHtml = this.state.results
      .map((book) => createBookCardHtml(book, this.isBookFavorite(book.id)))
      .join("");

    const grid = this.resultsContainer.querySelector("[data-results-grid]");
    if (grid) {
      grid.innerHTML = cardsHtml;

      grid.querySelectorAll("[data-book-card]").forEach((card) => {
        const bookId = (card as HTMLElement).dataset.bookId;
        if (bookId) {
          card.addEventListener("click", () => this.openDetailView(bookId));
        }
      });
    }
  }

  private renderDetailModal(): void {
    if (!this.detailModal) return;

    if (!this.state.selectedBook) {
      this.detailModal.classList.add("hidden");
      return;
    }

    const book = this.state.selectedBook;
    const isFav = this.isBookFavorite(book.id);

    this.detailModal.innerHTML = createDetailModalHtml(book, isFav);
    this.detailModal.classList.remove("hidden");

    const closeBtn = this.detailModal.querySelector("[data-close-modal]");
    closeBtn?.addEventListener("click", () => this.closeDetailView());

    const favBtn = this.detailModal.querySelector("[data-detail-favorite-btn]");
    favBtn?.addEventListener("click", () => {
      if (this.state.selectedBook) {
        this.handleToggleFavorite(this.state.selectedBook);
        this.renderDetailModal();
      }
    });
  }

  private renderFavorites(): void {
    if (!this.favoritesContainer) return;

    this.favoritesContainer.innerHTML = createFavoritesListHtml(
      this.state.favorites,
    );

    this.favoritesContainer.querySelectorAll("[data-book-id]").forEach((el) => {
      const bookId = (el as HTMLElement).dataset.bookId;
      if (bookId) {
        el.addEventListener("click", () => this.openDetailView(bookId));
      }
    });
  }
}

const app = new BookNestApp();
export default app;
