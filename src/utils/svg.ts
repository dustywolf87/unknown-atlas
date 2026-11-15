import type { GpxPoint } from './gpx';

// Profilo altimetrico (sparkline): coordinate della linea e dell'area sotto la curva.
export function elevationGeometry(elevations: number[]) {
  if (elevations.length < 2) return null;

  const w = 300;
  const h = 100;
  const pad = 6;
  const min = Math.min(...elevations);
  const range = Math.max(1, Math.max(...elevations) - min);
  const n = elevations.length;

  const coords = elevations.map((ele, i) => {
    const x = pad + (i / (n - 1)) * (w - pad * 2);
    const y = h - pad - ((ele - min) / range) * (h - pad * 2);
    return `${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`;
  });

  return {
    viewBox: `0 0 ${w} ${h}`,
    line: coords.join(' '),
    fill: `M${pad},${h - pad} L${coords.join(' L')} L${w - pad},${h - pad} Z`,
  };
}

// Traccia vista dall'alto, con curve di livello decorative sullo sfondo.
export function trackGeometry(points: GpxPoint[]) {
  if (points.length < 2) return null;

  const w = 800;
  const h = 460;
  const pad = 30;
  const lats = points.map((p) => p.lat);
  const lons = points.map((p) => p.lon);
  const minLat = Math.min(...lats);
  const minLon = Math.min(...lons);
  const rangeLat = Math.max(0.0001, Math.max(...lats) - minLat);
  const rangeLon = Math.max(0.0001, Math.max(...lons) - minLon);

  const coords = points.map((p) => {
    const x = pad + ((p.lon - minLon) / rangeLon) * (w - pad * 2);
    const y = h - pad - ((p.lat - minLat) / rangeLat) * (h - pad * 2);
    return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
  });

  const topo: string[] = [];
  for (let i = 0; i < 9; i++) {
    const yBase = (i + 1) * (h / 10);
    const amp = 14 + (i % 3) * 6;
    let d = `M -20 ${yBase}`;
    for (let x = 0; x <= w + 40; x += 40) {
      d += ` L ${x} ${Math.round((yBase + Math.sin(x / 90 + i * 1.3 + 1) * amp) * 10) / 10}`;
    }
    topo.push(d);
  }

  return {
    viewBox: `0 0 ${w} ${h}`,
    line: coords.map((c) => c.join(',')).join(' '),
    start: coords[0],
    end: coords[coords.length - 1],
    topo,
  };
}
