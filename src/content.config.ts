import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/articles',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    cover: z.string().optional(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});

const fieldNotes = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/field-notes',
  }),
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});

const routes = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/routes',
  }),
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    draft: z.boolean().default(false),
    region: z.string(),
    type: z.enum(['Hiking', 'Trekking', 'MTB']),
    difficulty: z.enum(['Easy', 'Moderate', 'Hard', 'Expert']).default('Moderate'),
    color: z.string().default('#c8643d'),
    // Se mancano, distanza, dislivello e durata vengono calcolati dal file GPX.
    distanceKm: z.number().optional(),
    elevationGainM: z.number().optional(),
    duration: z.string().optional(),
    // Nome del file GPX dentro public/gpx (es. "monte-rosa-loop.gpx").
    gpx: z.string().optional(),
    cover: z.string().optional(),
    gallery: z
      .array(z.object({ src: z.string(), alt: z.string().default('') }))
      .default([]),
    stages: z
      .array(
        z.object({
          name: z.string(),
          distanceKm: z.number(),
          elevationGainM: z.number(),
          gpx: z.string().optional(),
        })
      )
      .default([]),
    // Slot 1-4 in homepage (equivalente del Customizer "Percorsi in homepage").
    homeSlot: z.number().int().min(1).max(4).optional(),
  }),
});

export const collections = {
  articles,
  fieldNotes,
  routes,
};
