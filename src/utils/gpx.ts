import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export type GpxPoint = { lat: number; lon: number };
export type GpxData = {
  points: GpxPoint[];
  elevations: number[];
  distanceKm: number;
  elevGainM: number;
  duration?: string;
};

function haversineKm(a: GpxPoint, b: GpxPoint): number {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function formatDuration(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
}

// Legge un file GPX da public/gpx e ne ricava punti, quote, distanza, dislivello e durata.
export function parseGpx(fileName: string): GpxData | null {
  const path = join(process.cwd(), 'public', 'gpx', fileName);
  if (!existsSync(path)) return null;

  const xml = readFileSync(path, 'utf8');
  const points: GpxPoint[] = [];
  const elevations: number[] = [];
  const times: number[] = [];

  for (const m of xml.matchAll(/<trkpt\b([^>]*?)(?:\/>|>([\s\S]*?)<\/trkpt>)/g)) {
    const lat = m[1].match(/\blat="([^"]+)"/);
    const lon = m[1].match(/\blon="([^"]+)"/);
    if (!lat || !lon) continue;

    points.push({ lat: parseFloat(lat[1]), lon: parseFloat(lon[1]) });

    const ele = m[2]?.match(/<ele>([^<]+)<\/ele>/);
    if (ele) elevations.push(parseFloat(ele[1]));

    const time = m[2]?.match(/<time>([^<]+)<\/time>/);
    if (time) {
      const ts = Date.parse(time[1]);
      if (!Number.isNaN(ts)) times.push(ts);
    }
  }

  if (points.length === 0) return null;

  let distanceKm = 0;
  for (let i = 1; i < points.length; i++) distanceKm += haversineKm(points[i - 1], points[i]);

  let elevGainM = 0;
  for (let i = 1; i < elevations.length; i++) {
    const diff = elevations[i] - elevations[i - 1];
    if (diff > 0) elevGainM += diff;
  }

  let duration: string | undefined;
  if (times.length >= 2) {
    const seconds = (Math.max(...times) - Math.min(...times)) / 1000;
    if (seconds > 0) duration = formatDuration(Math.round(seconds / 60));
  }

  return {
    points,
    elevations,
    distanceKm: Math.round(distanceKm * 10) / 10,
    elevGainM: Math.round(elevGainM),
    duration,
  };
}

// Stima la durata quando il GPX non ha timestamp (regola di Naismith semplificata).
export function estimateDuration(distanceKm: number, elevGainM: number, type = ''): string | undefined {
  if (distanceKm <= 0) return undefined;

  const isBike = /mtb|bike|ciclis/i.test(type);
  const speedKmh = isBike ? 14 : 4;
  const climbMetersPerHour = isBike ? 900 : 600;

  const minutes = Math.round((distanceKm / speedKmh + elevGainM / climbMetersPerHour) * 60);
  return minutes > 0 ? formatDuration(minutes) : undefined;
}
