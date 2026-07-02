import { getBookDetails } from "./api.js";
import { Book } from "./types.js";

// Prepares a book for display in the detail modal.
export async function prepareBookForDetail(
  bookId: string,
  results: Book[],
): Promise<Book | null> {
  const bookFromResults = results.find((b) => b.id === bookId);

  if (!bookFromResults) {
    console.warn("Book not found in results:", bookId);
    return null;
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

  return book;
}
