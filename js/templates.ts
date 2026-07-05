import { Book } from "./types.js";
import { getCoverUrl } from "./utils.js";

// ========== BOOK CARD TEMPLATE ==========

// Create the HTML for a single book card in the search results
export function createBookCardHtml(book: Book, isFav: boolean): string {
  const coverUrl = getCoverUrl(book.coverId, "M");

  return `
    <div
      class="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer card-hover"
      data-book-card
      data-book-id="${book.id}"
    >
      <!-- Cover image area -->
      <div class="h-64 bg-sage flex items-center justify-center">
        <img
          src="${coverUrl}"
          alt="Cover of ${book.title}"
          class="h-full w-full object-cover"
          loading="lazy"
          onerror="this.src='assets/placeholder-cover.png'"
        >
      </div>

      <!-- Book info -->
      <div class="p-4">
        <!-- Title: uses display font, oxblood color, truncated if too long -->
        <h3 class="font-display font-bold text-lg text-oxblood mb-1 truncate">
          ${book.title}
        </h3>

        <!-- Author name -->
        <p class="text-warm-gray text-sm mb-2">${book.author}</p>

        <!-- Bottom row: publish year and favorite button -->
        <div class="flex items-center justify-between">
          <span class="text-xs text-warm-gray">${book.firstPublishYear}</span>

          <!-- Favorite toggle button -->
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

// ========== DETAIL MODAL TEMPLATE ==========

// Create the HTML for the book detail modal
export function createDetailModalHtml(book: Book, isFav: boolean): string {
  const coverUrl = getCoverUrl(book.coverId, "L");

  const yearSection = book.firstPublishYear
    ? `<p class="text-sm text-warm-gray mb-4">First published: ${book.firstPublishYear}</p>`
    : "";

  const descriptionSection = book.description
    ? `
      <div class="mb-4">
        <h3 class="font-semibold text-ink mb-2">Description</h3>
        <p class="text-ink text-sm leading-relaxed">${book.description}</p>
      </div>
    `
    : "";

  const subjectsSection =
    book.subjects && book.subjects.length > 0
      ? `
      <div>
        <h3 class="font-semibold text-ink mb-2">Subjects</h3>
        <div class="flex flex-wrap gap-2">
          ${book.subjects
            .map(
              (subject) =>
                `<span class="bg-parchment text-ink text-xs px-2 py-1 rounded">${subject}</span>`,
            )
            .join("")}
        </div>
      </div>
    `
      : "";

  return `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <!-- Modal content card -->
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">

        <div class="flex flex-col md:flex-row">
          <!-- Left side: Book cover (full width on mobile, 1/3 on desktop) -->
          <div class="md:w-1/3 bg-sage flex items-center justify-center p-4">
            <img
              src="${coverUrl}"
              alt="Cover of ${book.title}"
              class="w-full max-w-[200px] rounded shadow-lg"
              onerror="this.src='assets/placeholder-cover.png'"
            >
          </div>

          <div class="md:w-2/3 p-6">
            <!-- Title row with favorite and close buttons -->
            <div class="flex justify-between items-start mb-4 gap-4">
              <h2 class="font-display text-2xl font-bold text-oxblood flex-1">${book.title}</h2>
              <div class="flex items-center gap-2 flex-shrink-0">
                <button
                  class="text-2xl ${isFav ? "text-oxblood" : "text-warm-gray"} hover:text-oxblood transition-colors"
                  data-detail-favorite-btn
                  aria-label="${isFav ? "Remove from favorites" : "Add to favorites"}"
                  title="${isFav ? "Remove from favorites" : "Add to favorites"}"
                >
                  ${isFav ? "♥" : "♡"}
                </button>
                <button
                  class="text-2xl text-warm-gray hover:text-ink transition-colors"
                  data-close-modal
                  aria-label="Close detail view"
                  title="Close"
                >
                  ×
                </button>
              </div>
            </div>

            <!-- Author -->
            <p class="text-warm-gray mb-4">By ${book.author}</p>

            <!-- year, description, subjects -->
            ${yearSection}
            ${descriptionSection}
            ${subjectsSection}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ========== FAVORITES LIST TEMPLATE ==========

// Create the HTML for the favorites section
export function createFavoritesListHtml(favorites: Book[]): string {
  if (favorites.length === 0) {
    return '<p class="text-warm-gray text-center py-4">No favorites yet. Start exploring books!</p>';
  }

  const covers = favorites
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

  return `
    <div class="flex gap-2 overflow-x-auto pb-2" data-favorites-list>
      ${covers}
    </div>
  `;
}

// ========== FAVORITES PANEL TEMPLATE ==========

// Creates the HTML for the favorites slide-in panel content.
export function createFavoritesPanelHtml(favorites: Book[]): string {
  if (favorites.length === 0) {
    return `
      <p class="text-warm-gray text-center py-8">No favorites saved yet.</p>
      <p class="text-warm-gray text-center text-sm">Search for books and click the ♡ to save them here.</p>
    `;
  }

  const itemsHtml = favorites
    .map((book) => {
      const coverUrl = getCoverUrl(book.coverId, "S");

      return `
        <div class="flex items-center gap-3 py-3 border-b border-warm-gray border-opacity-30">
          <!-- Small book cover -->
          <img
            src="${coverUrl}"
            alt="Cover of ${book.title}"
            class="w-10 h-14 object-cover rounded flex-shrink-0"
            onerror="this.src='assets/placeholder-cover.png'"
          >
          <!-- Book title and author -->
          <div class="flex-1 min-w-0">
            <p class="font-display font-bold text-sm text-oxblood truncate">${book.title}</p>
            <p class="text-xs text-warm-gray truncate">${book.author}</p>
          </div>
          <!-- Unfavorite button -->
          <button
            class="text-oxblood hover:text-ink text-lg flex-shrink-0 transition-colors"
            data-panel-unfavorite="${book.id}"
            aria-label="Remove ${book.title} from favorites"
            title="Remove from favorites"
          >
            ♥
          </button>
        </div>
      `;
    })
    .join("");

  return itemsHtml;
}
