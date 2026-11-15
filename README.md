# unknown-atlas
UNKNOWN ATLAS — Independent journal and route archive

## Struttura cartelle pagine
`src/pages/
├── index.astro
├── articles.astro            ← l'elenco, direttamente in pages
├── articles/
│   └── [slug].astro          ← solo l'articolo singolo
├── field-notes/
│   ├── [...page].astro
│   └── [slug].astro
├── routes.astro
├── routes/
│   └── [slug].astro
├── route-type/
│   └── [type].astro
└── region/
    └── [region].astro
`
