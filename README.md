# OST CLARIN SKG-IF browser

A small web front end for browsing a Scholarly Knowledge Graph exposed through an
[SKG-IF](https://skg-if.github.io/) compatible API, built for OSTrails / CLARIN.

> **Status:** early work in progress. Only the paginated **Products** list and the product details page work; 
> rest of the entities to follow.

## Tech stack

- [React 19](https://react.dev/) + TypeScript
- [Vite](https://vite.dev/) for dev server and builds
- [TanStack Router](https://tanstack.com/router) for routing
- [TanStack Query](https://tanstack.com/query) for data fetching and caching

## Getting started

Requirements: Node.js (a recent LTS) and npm.

```bash
npm install
npm run dev
```

The dev server prints the local URL (by default http://localhost:5173).

### Configuration

The API base URL is read from the `VITE_API_BASE` environment variable, e.g. in a
`.env` file in the project root:

```dotenv
VITE_API_BASE=https://example.org/api/v1
```

If unset, it defaults to the relative path `/api/v1`, so the API must then be
served from the same origin as the app (no dev proxy is configured in
`vite.config.ts`). A trailing slash is stripped.

## Scripts

| Command           | Description                                      |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Start the Vite dev server with hot reload        |
| `npm run build`   | Type-check (`tsc -b`) and build to `dist/`       |
| `npm run preview` | Serve the production build locally               |
| `npm run lint`    | Run ESLint                                       |

## Routes

| Path             | Description                                              |
| ---------------- | -------------------------------------------------------- |
| `/`              | Redirects to `/products`                                 |
| `/$entity`       | Paginated list of an entity type (`?page=`, `?size=`)    |
| `/$entity/$id`   | Entity details (placeholder)                             |

## API usage

Requests are sent with `Accept: application/ld+json, application/json` and expect
SKG-IF JSON-LD responses with results in `@graph`:

- **List:** `GET {API_BASE}/{entity}?page=1&page_size=20[&filter=key:value,...]`
  — the total count is read from `meta.part_of.total_items`, which enables
  "page X of Y" and the *Last* button. Without it, a next page is assumed while a
  full page is returned.
- **Single item:** `GET {API_BASE}/{entity}/{id}` — the first `@graph` entry is used.

Error responses surface `detail` / `message` and any `unsupported_filters` from the
response body.

Multilingual fields (titles, abstracts, labels) are shown in English, falling back
to `none`, then to the first available language.

## Project structure

```
src/
├── api.ts                 # SKG-IF types, fetch helpers, text utilities
├── entities.ts            # Registry of browsable entity types
├── router.tsx             # Route definitions
├── main.tsx               # App entry: QueryClient + RouterProvider
├── index.css              # Global styles
└── components/
    ├── Layout.tsx         # Header and page shell
    ├── EntityList.tsx     # Paginated list view
    └── EntityDetails.tsx  # Details view (placeholder)
```

## Adding an entity type

Entity types are configured in `src/entities.ts`. Add an entry to `ENTITIES` with
the API path segment, a display label, and functions that derive a title and
subtitle from an item:

```ts
{
    path: 'persons',
    label: 'Persons',
    title: (item) => (item as Person).name ?? item.local_identifier,
    subtitle: () => undefined,
}
```

It then becomes available at `/persons`.
