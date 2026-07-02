import { Book, OpenLibraryDoc } from "./types.js";

const COVERS_BASE = "https://covers.openlibrary.org/b/id";

// ================= Transforms a raw OpenLibrary document into predefined clean Book interface =================
export function transformBookDoc(doc: OpenLibraryDoc): Book {
  return {
    id: doc.key,
    title: doc.title || "Untitled",
    author: doc.author_name?.[0] ?? "Unknown Author",
    coverId: doc.cover_i ?? null,
    firstPublishYear: doc.first_publish_year ?? "Unknown",
    editionCount: doc.edition_count ?? 0,
    subjects: doc.subject?.slice(0, 5),
    description: doc.first_sentence?.join(" ") || undefined,
  };
}

// ================= Constructs a cover image URL from a cover ID =================
export function getCoverUrl(
  coverId: number | null,
  size: "S" | "M" | "L" = "M",
): string {
  if (coverId === null || coverId === undefined) {
    return "/assets/placeholder-cover.png";
  }
  return `${COVERS_BASE}/${coverId}-${size}.jpg`;
}

// ================= Type guard to check if an unknown value is a valid Book object =================
export function isBook(value: unknown): value is Book {
  if (!value || typeof value !== "object") return false;
  const book = value as Record<string, unknown>;
  return (
    typeof book.id === "string" &&
    typeof book.title === "string" &&
    typeof book.author === "string"
  );
}
