import { newFilm } from "./model.js";
export const imagePath = (path, size = "w500") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : "";
export class Tmdb {
  constructor(getKey, fetcher = globalThis.fetch) {
    this.getKey = getKey;
    this.fetch = fetcher;
  }
  async get(path, params = {}, signal) {
    const key = String(this.getKey() || "").trim();
    if (!key)
      throw Error(
        "Renseigne ta clé TMDB dans Paramètres pour chercher en ligne.",
      );
    const url = new URL("https://api.themoviedb.org/3" + path);
    url.search = new URLSearchParams({
      api_key: key,
      language: "fr-FR",
      ...params,
    });
    const control = new AbortController(),
      abort = () => control.abort();
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) abort();
    const timer = setTimeout(abort, 15000);
    try {
      const r = await this.fetch(url, { signal: control.signal });
      if (!r.ok)
        throw Error(
          r.status === 401
            ? "Clé TMDB refusée. Vérifie-la dans Paramètres."
            : r.status === 429
              ? "TMDB reçoit trop de requêtes. Réessaie dans quelques instants."
              : `TMDB indisponible (${r.status}).`,
        );
      return await r.json();
    } catch (e) {
      if (control.signal.aborted && !signal?.aborted)
        throw Error("TMDB ne répond pas. Tu peux réessayer.");
      throw e;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
    }
  }
  async search(query, kind = "multi", page = 1, signal) {
    const result = await this.get(
      "/search/" + kind,
      { query, page, include_adult: false },
      signal,
    );
    return {
      items: (result.results || []).map((x) => ({
        ...x,
        kind: x.media_type || kind,
        title: x.title || x.name || "",
        poster: imagePath(x.poster_path || x.profile_path),
      })),
      page: result.page || page,
      pages: result.total_pages || 0,
      total: result.total_results || 0,
    };
  }
  details(id, kind) {
    return this.get(`/${kind}/${id}`, {
      append_to_response: "credits,videos,images",
      include_image_language: "fr,en,null",
    });
  }
  async credits(id) {
    const data = await this.get(`/person/${id}/combined_credits`);
    const seen = new Set();
    return [...(data.cast || []), ...(data.crew || [])]
      .filter((x) => {
        const key = x.media_type + ":" + x.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((x) => ({
        ...x,
        kind: x.media_type,
        title: x.title || x.name,
        poster: imagePath(x.poster_path),
      }));
  }
  async collection(id) {
    const data = await this.get(`/collection/${id}`);
    return {
      ...data,
      items: (data.parts || [])
        .sort((a, b) =>
          String(a.release_date).localeCompare(String(b.release_date)),
        )
        .map((x) => ({
          ...x,
          kind: "movie",
          title: x.title,
          poster: imagePath(x.poster_path),
        })),
    };
  }
  season(id, num) {
    return this.get(`/tv/${id}/season/${num}`);
  }
  async company(id, page = 1) {
    const d = await this.get("/discover/movie", { with_companies: id, page });
    return {
      items: (d.results || []).map((x) => ({
        ...x,
        kind: "movie",
        title: x.title,
        poster: imagePath(x.poster_path),
      })),
      pages: d.total_pages,
      page,
    };
  }
  toFilm(d, kind) {
    const crew = (job) =>
      (d.credits?.crew || [])
        .filter((x) => x.job === job)
        .map((x) => x.name)
        .join(", ");
    return newFilm({
      tmdbId: d.id,
      tmdbType: kind,
      categorie: kind === "tv" ? "series" : "films",
      titre: d.title || d.name,
      originalTitle: d.original_title || d.original_name,
      resume: d.overview || "",
      affichePath: imagePath(d.poster_path),
      backdropPath: imagePath(d.backdrop_path, "original"),
      dateSortie: d.release_date || d.first_air_date || "",
      notesTmdb: d.vote_average || 0,
      genres: (d.genres || []).map((g) => g.name).join(", "),
      casting: (d.credits?.cast || [])
        .slice(0, 25)
        .map((a) => a.name)
        .join(", "),
      castingDetails: (d.credits?.cast || [])
        .slice(0, 25)
        .map((a) => ({
          id: a.id,
          name: a.name,
          character: a.character,
          photo: imagePath(a.profile_path, "w185"),
        })),
      realisateur: crew("Director"),
      producteur: crew("Producer"),
      scenariste: crew("Screenplay") || crew("Writer"),
      createur: (d.created_by || []).map((x) => x.name).join(", "),
      pays: (d.production_countries || []).map((x) => x.name),
      duree: d.runtime || d.episode_run_time?.[0] || 0,
      sagas: d.belongs_to_collection ? [d.belongs_to_collection.name] : [],
      collectionId: d.belongs_to_collection?.id || null,
      trailerKey:
        (d.videos?.results || []).find(
          (x) => x.site === "YouTube" && x.type === "Trailer",
        )?.key || "",
      seasons: d.seasons || [],
    });
  }
}
