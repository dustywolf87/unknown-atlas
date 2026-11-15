// Regole comuni di pubblicazione e ordinamento per le collezioni.

type Publishable = { data: { draft: boolean; pubDate: Date } };

// In sviluppo mostra tutto; in produzione solo contenuti non bozza con data già passata.
export function isPublished(entry: Publishable): boolean {
  return import.meta.env.DEV || (!entry.data.draft && entry.data.pubDate <= new Date());
}

export function byDateDesc(a: Publishable, b: Publishable): number {
  return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

// Testo semplice dal Markdown di una nota, tagliato a una lunghezza massima su un confine di parola.
export function plainExcerpt(markdown: string, maxChars = 140): string {
  const text = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#*_>`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars).replace(/\s+\S*$/, '') + '…';
}
