// Show an element by removing the 'hidden' class.
export function showElement(el: HTMLElement | null): void {
  if (el) {
    el.classList.remove("hidden");
  }
}

// Hide an element by adding the 'hidden' class.
export function hideElement(el: HTMLElement | null): void {
  if (el) {
    el.classList.add("hidden");
  }
}

// Cache a DOM element by its ID.
export function getElementById<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}
