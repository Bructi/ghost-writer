import { Readability } from '@mozilla/readability';
import DOMPurify from 'dompurify';

export function extractPageContent() {
  // 1. Create a clone of the document (Readability mutates the DOM, so we clone it first)
  const documentClone = document.cloneNode(true);

  // 2. Parse the content
  const reader = new Readability(documentClone);
  const article = reader.parse();

  // 3. Handle failure (e.g., if the page has no text)
  if (!article) {
    return {
      title: document.title,
      content: "Could not extract main content.",
      length: 0
    };
  }

  // 4. Return clean data
  return {
    title: article.title,
    // We stick to plain text for the AI analysis later
    text: article.textContent.trim(),
    // We keep HTML if we want to display a "Clean View" later
    html: DOMPurify.sanitize(article.content),
    length: article.textContent.length,
    siteName: article.siteName || window.location.hostname
  };
}