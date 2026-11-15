import { getCollection, type CollectionEntry } from 'astro:content';
import { parseGpx, estimateDuration, type GpxPoint } from './gpx';
import { isPublished, byDateDesc } from './content';

export type RouteView = {
  id: string;
  entry: CollectionEntry<'routes'>;
  title: string;
  region: string;
  regionSlug: string;
  type: string;
  typeSlug: string;
  difficulty: string;
  color: string;
  distance: string;
  elevation: string;
  duration: string;
  gpxUrl?: string;
  points: GpxPoint[];
  elevations: number[];
  homeSlot?: number;
};

// Profilo di ripiego quando il percorso non ha un GPX (come nel tema WordPress).
const PLACEHOLDER_ELEVATIONS = [10, 40, 25, 60, 45, 80, 55, 90, 60, 30, 20];

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function gpxHref(fileName: string): string {
  return `/gpx/${fileName}`;
}

// Valori manuali prioritari, con ripiego sui dati calcolati dal GPX.
function toRouteView(entry: CollectionEntry<'routes'>): RouteView {
  const d = entry.data;
  const gpx = d.gpx ? parseGpx(d.gpx) : null;

  const distance = d.distanceKm ?? gpx?.distanceKm;
  const elevation = d.elevationGainM ?? gpx?.elevGainM;
  const duration =
    d.duration ??
    gpx?.duration ??
    (distance !== undefined ? estimateDuration(distance, elevation ?? 0, d.type) : undefined);

  return {
    id: entry.id,
    entry,
    title: d.title,
    region: d.region,
    regionSlug: slugify(d.region),
    type: d.type,
    typeSlug: slugify(d.type),
    difficulty: d.difficulty,
    color: d.color,
    distance: distance !== undefined ? String(distance) : '',
    elevation: elevation !== undefined ? String(elevation) : '',
    duration: duration ?? '',
    gpxUrl: d.gpx ? gpxHref(d.gpx) : undefined,
    points: gpx?.points ?? [],
    elevations: gpx && gpx.elevations.length > 1 ? gpx.elevations : PLACEHOLDER_ELEVATIONS,
    homeSlot: d.homeSlot,
  };
}

// Più recenti prima; a parità di data, titolo A–Z.
export async function getRouteViews(): Promise<RouteView[]> {
  const entries = (await getCollection('routes')).filter(isPublished);
  entries.sort((a, b) => byDateDesc(a, b) || a.data.title.localeCompare(b.data.title));
  return entries.map(toRouteView);
}

// 4 percorsi: quelli con homeSlot (nell'ordine degli slot), slot vuoti riempiti coi più recenti.
export function pickHomeRoutes(views: RouteView[]): RouteView[] {
  const slots: (RouteView | undefined)[] = [undefined, undefined, undefined, undefined];
  for (const v of views) {
    if (v.homeSlot && !slots[v.homeSlot - 1]) slots[v.homeSlot - 1] = v;
  }
  const rest = views.filter((v) => !slots.includes(v));
  return slots.map((v) => v ?? rest.shift()).filter((v): v is RouteView => Boolean(v));
}

type Filter = { name: string; slug: string };

function uniqueFilters(items: Filter[]): Filter[] {
  const map = new Map(items.map((i) => [i.slug, i]));
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export const typeFilters = (views: RouteView[]) =>
  uniqueFilters(views.map((v) => ({ name: v.type, slug: v.typeSlug })));

export const regionFilters = (views: RouteView[]) =>
  uniqueFilters(views.map((v) => ({ name: v.region, slug: v.regionSlug })));
