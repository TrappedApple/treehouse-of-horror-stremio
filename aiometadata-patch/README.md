# AIOMetadata custom episode collections patch

This branch contains a proposed generic implementation for curated episode collections in AIOMetadata.

## Goal

Allow a catalog to expose one synthetic series entry with custom artwork. Opening that entry returns an ordered list of real episode video IDs, so existing stream addons continue to receive canonical IDs such as `tt0096697:2:3`.

## Proposed catalog shape

```json
{
  "id": "custom.episodecollection.treehouse-of-horror",
  "type": "series",
  "name": "The Simpsons: Treehouse of Horror",
  "source": "episodeCollection",
  "enabled": true,
  "showInHome": true,
  "metadata": {
    "collection": {
      "id": "treehouse-of-horror",
      "name": "The Simpsons: Treehouse of Horror",
      "poster": "https://m.media-amazon.com/images/M/MV5BY2ZmZTM4OGYtZGYwYS00MWE0LThkZmEtODI5NmI5ODBjZWQzXkEyXkFqcGc%40._V1_FMjpg_UX1000_.jpg",
      "background": "https://fwcdn.pl/fpo/79/60/87960/8034587_1.3.jpg",
      "description": "The annual Simpsons Halloween anthology specials collected in one place.",
      "videos": [
        { "id": "tt0096697:2:3", "title": "Treehouse of Horror", "season": 1, "episode": 1 },
        { "id": "tt0096697:3:7", "title": "Treehouse of Horror II", "season": 1, "episode": 2 }
      ]
    }
  }
}
```

## Backend changes

### `addon/lib/getCatalog.ts`

Import the helper:

```ts
import {
  isEpisodeCollectionCatalogId,
  buildEpisodeCollectionCatalogMeta,
} from './customEpisodeCollections';
```

Before the generic `custom.*` external-addon branch, add:

```ts
else if (isEpisodeCollectionCatalogId(id)) {
  return { metas: buildEpisodeCollectionCatalogMeta(config, id) };
}
```

This must come before the existing `id.startsWith('custom.')` branch so the new internal catalog type is not routed as an external addon.

### `addon/lib/getMeta.js`

Import the helper (or provide a CommonJS wrapper if preferred):

```js
const { buildEpisodeCollectionMeta } = require('./customEpisodeCollections');
```

Near the start of `getMeta`, before ordinary ID resolution:

```js
if (stremioId.startsWith('episodecollection:')) {
  const result = buildEpisodeCollectionMeta(config, stremioId);
  if (result) return result;
}
```

The important behavior is that the synthetic series has its own meta ID, while the `videos[]` entries retain their canonical real episode IDs. AIOMetadata should not rewrite those video IDs.

## Artwork

The collection definition supports:

- `poster`
- `background`
- `logo`
- `description`
- per-episode `thumbnail`

This makes the collection usable as a polished Nuvio folder/catalog tile rather than a text-only entry.

## Import/export

The collection blueprint should be preserved under `catalog.metadata.collection` when exporting Nuvio collections. That allows the catalog to be reconstructed from a shared collection file with no separate web service.

## Example

See `treehouse-of-horror.catalog.json` for a complete Treehouse of Horror definition.
