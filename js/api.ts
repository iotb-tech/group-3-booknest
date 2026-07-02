import { Book, OpenLibrarySearchResponse } from "./types.js";
import { transformBookDoc } from "./utils.js";

const API_BASE = "https://openlibrary.org";

// ================= Search for books using the Open Library API =================
export async function searchBooks(
  query: string,
  limit: number = 20,
): Promise<Book[]> {
  if (!query.trim()) {
    return [];
  }

  const encodedQuery = encodeURIComponent(query.trim());

  const fieldsNeeded = [
    "key",
    "title",
    "author_name",
    "cover_i",
    "first_publish_year",
    "edition_count",
    "subject",
    "first_sentence",
  ].join(",");

  const url = `${API_BASE}/search.json?q=${encodedQuery}&limit=${limit}&fields=${fieldsNeeded}`;

  try {
    const response: Response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch books: HTTP ${response.status}`);
    }

    const data: OpenLibrarySearchResponse = await response.json();

    if (!data.docs || data.docs.length === 0) {
      return [];
    }

    // Transform each raw doc into a clean Book using the utility function
    return data.docs.map(transformBookDoc);
  } catch (error) {
    console.error(
      "Error in searchBooks:",
      error instanceof Error ? error.message : "Unknown error",
    );
    throw error;
  }
}

// ================= Fetch detailed information about a single book by its ID =================
export async function getBookDetails(bookId: string): Promise<Partial<Book>> {
  const cleanId = bookId.replace("/works/", "").replace("/books/", "");
  const url = `${API_BASE}/works/${cleanId}.json`;

  try {
    const response: Response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch book details: HTTP ${response.status}`);
    }

    const data = await response.json();

    return {
      id: data.key || bookId,
      title: data.title || "Untitled",
      author: "Unknown Author",
      coverId: data.covers?.[0] ?? null,
      firstPublishYear: "Unknown",
      subjects: data.subjects?.slice(0, 10),
      description:
        typeof data.description === "string" ? data.description : undefined,
    };
  } catch (error) {
    console.error("Error in getBookDetails:", error);
    throw error;
  }
}
