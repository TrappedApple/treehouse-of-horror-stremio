export interface EpisodeCollectionVideo {
  id: string;
  title: string;
  season?: number;
  episode?: number;
  released?: string;
  overview?: string;
  thumbnail?: string;
}

export interface EpisodeCollectionDefinition {
  id: string;
  name: string;
  poster?: string;
  background?: string;
  logo?: string;
  description?: string;
  videos: EpisodeCollectionVideo[];
}

function collectionFromCatalogConfig(config: any, catalogId: string): EpisodeCollectionDefinition | null {
  const catalog = config?.catalogs?.find((item: any) => item?.id === catalogId);
  const collection = catalog?.metadata?.collection;
  if (!collection || !Array.isArray(collection.videos)) return null;
  if (!collection.id || !collection.name) return null;
  return collection as EpisodeCollectionDefinition;
}

export function isEpisodeCollectionCatalogId(id: string): boolean {
  return typeof id === 'string' && id.startsWith('custom.episodecollection.');
}

export function buildEpisodeCollectionCatalogMeta(config: any, catalogId: string): any[] {
  const collection = collectionFromCatalogConfig(config, catalogId);
  if (!collection) return [];

  return [{
    id: `episodecollection:${collection.id}`,
    type: 'series',
    name: collection.name,
    ...(collection.poster && { poster: collection.poster }),
    ...(collection.background && { background: collection.background }),
    ...(collection.logo && { logo: collection.logo }),
    ...(collection.description && { description: collection.description }),
  }];
}

export function buildEpisodeCollectionMeta(config: any, stremioId: string): any | null {
  if (!stremioId.startsWith('episodecollection:')) return null;
  const collectionId = stremioId.slice('episodecollection:'.length);

  for (const catalog of config?.catalogs || []) {
    const collection = catalog?.metadata?.collection as EpisodeCollectionDefinition | undefined;
    if (!collection || collection.id !== collectionId || !Array.isArray(collection.videos)) continue;

    return {
      meta: {
        id: stremioId,
        type: 'series',
        name: collection.name,
        ...(collection.poster && { poster: collection.poster }),
        ...(collection.background && { background: collection.background }),
        ...(collection.logo && { logo: collection.logo }),
        ...(collection.description && { description: collection.description }),
        videos: collection.videos.map((video, index) => ({
          id: video.id,
          title: video.title,
          season: video.season ?? 1,
          episode: video.episode ?? index + 1,
          ...(video.released && { released: video.released }),
          ...(video.overview && { overview: video.overview }),
          ...(video.thumbnail && { thumbnail: video.thumbnail }),
        })),
      },
    };
  }

  return null;
}
