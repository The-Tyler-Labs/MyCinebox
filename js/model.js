export const categories = {
  films: "Films",
  series: "Séries",
  spectacles: "Spectacles",
  documentaires: "Documentaires",
  theatre: "Théâtre",
  animation: "Animation",
  humour: "Humour / sketchs",
};
export const statuses = {
  trouver: "À trouver",
  avoir: "À regarder",
  plustard: "Pour plus tard",
  cours: "En cours",
  vu: "Vu",
  critique: "À critiquer",
  ccdr: "Coup de cœur",
  meilleurequalite: "Meilleure qualité",
};
export const uid = () => crypto.randomUUID();
export const clone = (value) => JSON.parse(JSON.stringify(value));
export const words = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .trim();
export const list = (value) =>
  Array.isArray(value)
    ? value
    : String(value || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
export const typeOf = (film) =>
  film.tmdbType || (film.categorie === "series" ? "tv" : "movie");
export const identity = (film) =>
  film.tmdbId ? `${typeOf(film)}:${film.tmdbId}` : `manual:${film.id}`;
export function normalizeFilm(value) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    typeof value.titre !== "string"
  )
    throw Error("Une fiche ne contient pas de titre valide.");
  const statuts = list(
    value.statuts ?? value.statut ?? (value.estVu ? "vu" : ""),
  );
  return {
    ...value,
    id: value.id ?? uid(),
    categorie: categories[value.categorie] ? value.categorie : "films",
    statuts,
    sagas: list(value.sagas ?? value.saga),
    qualites: list(value.qualites ?? value.qualite),
    pays: list(value.pays ?? value.nationalite),
    visionnages: Array.isArray(value.visionnages) ? value.visionnages : [],
    episodesVus:
      value.episodesVus && typeof value.episodesVus === "object"
        ? value.episodesVus
        : {},
    editions: Array.isArray(value.editions)
      ? value.editions
      : list(value.versions).map((label) => ({
          id: uid(),
          label,
          rawName: "",
          details: [],
          languages: [],
        })),
    dateAjout: value.dateAjout || Date.now(),
  };
}
export function validateBundle(input) {
  const data = Array.isArray(input) ? { films: input } : input;
  if (!data || !Array.isArray(data.films))
    throw Error("Ce fichier ne contient pas une collection.");
  const films = data.films.map(normalizeFilm),
    seen = new Set();
  for (const f of films) {
    if (seen.has(String(f.id))) f.id = uid();
    seen.add(String(f.id));
  }
  return {
    films,
    ...(data.prefs &&
    typeof data.prefs === "object" &&
    !Array.isArray(data.prefs)
      ? { prefs: clone(data.prefs) }
      : {}),
    ...(Array.isArray(data.notes) ? { notes: clone(data.notes) } : {}),
    ...(data.sagaAffiches && typeof data.sagaAffiches === "object"
      ? { sagaAffiches: clone(data.sagaAffiches) }
      : {}),
  };
}
export function newFilm(fields = {}) {
  return normalizeFilm({
    id: uid(),
    titre: "Sans titre",
    dateAjout: Date.now(),
    ...fields,
  });
}
export function localSearch(films, query, kind = "multi") {
  const terms = words(query).split(/\s+/).filter(Boolean);
  const matches = (text) => terms.every((t) => words(text).includes(t));
  if (kind === "person") {
    const people = new Map();
    for (const f of films) {
      for (const p of [
        ...(f.castingDetails || []),
        ...list(f.casting).map((name) => ({ name })),
        ...list(f.realisateur).map((name) => ({ name })),
      ]) {
        if (p.name && matches(p.name)) {
          const key = words(p.name);
          if (!people.has(key) || p.id)
            people.set(key, { ...p, kind: "person", title: p.name });
        }
      }
    }
    return [...people.values()];
  }
  if (kind === "collection") {
    const sagas = new Map();
    for (const f of films)
      for (const name of f.sagas || []) {
        if (matches(name)) {
          if (!sagas.has(name))
            sagas.set(name, { kind: "localSaga", title: name, films: [] });
          sagas.get(name).films.push(f);
        }
      }
    return [...sagas.values()];
  }
  return films
    .filter(
      (f) =>
        (kind === "multi" || typeOf(f) === kind) &&
        matches(
          [
            f.titre,
            f.titreAlt,
            f.originalTitle,
            f.casting,
            f.realisateur,
            f.createur,
            f.genres,
            ...(f.sagas || []),
          ].join(" "),
        ),
    )
    .map((f) => ({ kind: "local", title: f.titre, film: f }));
}
export function filterFilms(
  films,
  { query = "", category = "", status = "", genre = "", sort = "recent" } = {},
) {
  let result = localSearch(films, query)
    .map((x) => x.film)
    .filter(
      (f) =>
        (!category || f.categorie === category) &&
        (!status || f.statuts.includes(status)) &&
        (!genre || words(f.genres).includes(words(genre))),
    );
  const date = (f) => String(f.dateSortie || f.annee || "");
  result.sort((a, b) =>
    sort === "title"
      ? a.titre.localeCompare(b.titre, "fr")
      : sort === "year"
        ? date(b).localeCompare(date(a))
        : sort === "rating"
          ? Number(b.maNote || 0) - Number(a.maNote || 0)
          : Number(b.dateAjout) - Number(a.dateAjout),
  );
  return result;
}
export function mergeFilms(local, remote) {
  const result = new Map(remote.map((f) => [identity(f), f]));
  for (const f of local) result.set(identity(f), f);
  return validateBundle([...result.values()]).films;
}
export function watchHistory(films) {
  return films
    .flatMap((f) => [
      ...(f.visionnages || []).map((watch, index) => ({
        film: f,
        watch,
        index,
        episode: null,
      })),
      ...Object.entries(f.episodesVus || {}).flatMap(([episode, watches]) =>
        (Array.isArray(watches) ? watches : []).map((watch, index) => ({
          film: f,
          watch,
          index,
          episode,
        })),
      ),
    ])
    .sort((a, b) => String(b.watch.date).localeCompare(String(a.watch.date)));
}
export function editionFromFilename(rawName) {
  const labels = [
    ["2160p|4k", "4K"],
    ["1080p", "1080p"],
    ["720p", "720p"],
    ["remux", "REMUX"],
    ["bluray|blu-ray", "Blu-ray"],
    ["web[ .-]?(dl|rip)", "WEB"],
    ["hdr", "HDR"],
    ["dolby.?vision|\\bdv\\b", "Dolby Vision"],
    ["extended|version.longue", "Version longue"],
    ["director.?s.?cut", "Director’s Cut"],
  ];
  return {
    id: uid(),
    label: rawName,
    rawName,
    details: labels
      .filter(([rx]) => new RegExp(rx, "i").test(rawName))
      .map(([, label]) => label),
    languages: ["VFF", "VFQ", "VOSTFR", "MULTI", "VO"].filter((x) =>
      new RegExp("\\b" + x + "\\b", "i").test(rawName),
    ),
    source: "",
    emplacement: "",
  };
}
