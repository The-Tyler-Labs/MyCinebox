import {
  categories,
  statuses,
  uid,
  clone,
  list,
  typeOf,
  identity,
  newFilm,
  filterFilms,
  watchHistory,
  editionFromFilename,
} from "./model.js";
import { Store } from "./store.js";
import { DEFAULT_TMDB_KEY } from "./config.js";
import { Tmdb, imagePath } from "./tmdb.js";
import { Search } from "./search.js";
import { Session } from "./session.js";
import { Sync } from "./sync.js";
import { dom, safeImage, download } from "./ui.js";
export async function createApp({
  document = globalThis.document,
  window = globalThis.window,
  store = new Store(),
  tmdb,
  session = new Session(),
} = {}) {
  const { h, button, field, select } = dom(document),
    root = document.getElementById("app");
  await store.open();
  tmdb ??= new Tmdb(() => store.state.prefs.apiKey || DEFAULT_TMDB_KEY);
  let bannerTimer;
  let route = "home",
    searchHost,
    settingsStatus,
    googleHost,
    toastTimer,
    dialog,
    selected = new Set(),
    filters = { category: "", status: "", genre: "", sort: "recent" },
    historySort = "desc";
  const toast = h("div", { class: "toast", role: "status", hidden: true });
  const notify = (message) => {
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toast.hidden = true), 6500);
  };
  const run = async (fn, node) => {
    if (node) node.disabled = true;
    try {
      return await fn();
    } catch (e) {
      notify(e.message || "Action impossible.");
    } finally {
      if (node) node.disabled = false;
    }
  };
  const action = (label, fn, props = {}) =>
    button(label, (e) => run(fn, e.currentTarget), props);
  const search = new Search(
    () => store.state.films,
    tmdb,
    () => renderResults(),
  );
  let syncMessage = "";
  const sync = new Sync(store, session, (message) => {
    syncMessage = message;
    if (settingsStatus) settingsStatus.textContent = message;
  });
  const accountStatus = h("small", {}, "Collection locale");
  const main = h("main", { id: "main", tabIndex: -1 }),
    nav = h("nav", { "aria-label": "Navigation principale" });
  const routes = {
    home: "Accueil",
    collection: "Collection",
    search: "Recherche",
    add: "Ajouter",
    history: "Visionnages",
    notes: "Notes",
    settings: "Paramètres",
  };
  for (const [key, label] of Object.entries(routes))
    nav.append(button(label, () => navigate(key), { dataset: { route: key } }));
  root.replaceChildren(
    h(
      "header",
      {},
      h("div", { class: "brand" }, "My", h("span", {}, "Cinebox")),
      accountStatus,
    ),
    h("div", { class: "layout" }, nav, main),
    h(
      "footer",
      {},
      "MyCinebox · Cette application utilise l’API TMDB mais n’est ni approuvée ni certifiée par TMDB.",
    ),
    toast,
  );
  const applyPrefs = () => {
    document.body.classList.toggle(
      "light",
      store.state.prefs.theme === "light",
    );
    document.documentElement.style.fontSize =
      (Number(store.state.prefs.fontSize) || 16) + "px";
  };
  applyPrefs();
  function navigate(next, push = true) {
    if (!routes[next]) next = "home";
    route = next;
    dialog?.close();
    searchHost = null;
    settingsStatus = null;
    googleHost = null;
    selected.clear();
    nav.querySelectorAll("button").forEach((b) => {
      b.classList.toggle("active", b.dataset.route === route);
      b.setAttribute(
        "aria-current",
        b.dataset.route === route ? "page" : "false",
      );
    });
    if (push) window.history.pushState({ route }, "", `#${route}`);
    render();
  }
  function render() {
    clearInterval(bannerTimer);
    main.replaceChildren(h("h1", {}, routes[route]));
    if (["collection", "search", "add"].includes(route)) renderSearch();
    else if (route === "settings") renderSettings();
    else if (route === "notes") renderNotes();
    else if (route === "history") renderHistory();
    else renderHome();
  }
  function poster(src, title, click) {
    const image = safeImage(src)
      ? h("img", {
          class: "poster",
          src: safeImage(src),
          alt: title,
          loading: "lazy",
          onError: (e) => {
            e.target.removeAttribute("src");
            e.target.alt = "Affiche indisponible";
          },
        })
      : h(
          "div",
          { class: "poster placeholder", "aria-label": "Sans affiche" },
          "◇",
        );
    return button("", click, {
      class: "poster-button",
      "aria-label": "Ouvrir " + title,
    }).appendChild(image).parentNode;
  }
  function card(item) {
    const local =
      item.kind === "local"
        ? item.film
        : store.state.films.find(
            (f) => f.tmdbId === item.id && typeOf(f) === item.kind,
          );
    const title = item.title || item.titre || "",
      open = () => run(() => openItem(item));
    const body = h(
      "div",
      { class: "card-body" },
      h("h3", {}, title),
      h(
        "small",
        {},
        item.kind === "person"
          ? "Personne"
          : item.kind === "collection" || item.kind === "localSaga"
            ? "Saga"
            : String(
                local?.dateSortie ||
                  item.release_date ||
                  item.first_air_date ||
                  "",
              ).slice(0, 4),
      ),
      local ? h("div", { class: "badge" }, "Dans ma collection") : null,
    );
    if (item.kind === "movie" || item.kind === "tv")
      body.append(
        action(
          local ? "Ouvrir la fiche" : "Ajouter",
          () => (local ? openDetail(local) : addRemote(item)),
          { class: local ? "" : "primary" },
        ),
      );
    const node = h(
      "article",
      { class: "card" },
      poster(
        local?.affichePath ||
          item.poster ||
          item.photo ||
          (item.kind === "localSaga"
            ? store.state.sagaAffiches[item.title]
            : ""),
        title,
        open,
      ),
      body,
    );
    if (route === "collection" && local) {
      const check = h("input", {
        type: "checkbox",
        checked: selected.has(String(local.id)),
        "aria-label": "Sélectionner " + title,
        onChange: (e) => {
          if (e.target.checked) selected.add(String(local.id));
          else selected.delete(String(local.id));
          updateBatch();
        },
      });
      node.append(h("label", { class: "select-card" }, check));
    }
    return node;
  }
  function grid(items) {
    const node = h("div", { class: "grid" });
    const cols = Number(store.state.prefs.cols);
    if (cols >= 2 && cols <= 6) node.style.setProperty("--cols", String(cols));
    node.append(...items.map(card));
    return node;
  }
  function renderHome() {
    const films = store.state.films,
      seen = films.filter((f) => f.statuts.includes("vu")).length;
    main.append(
      h(
        "div",
        { class: "stats" },
        ...[
          [films.length, "Titres"],
          [seen, "Vus"],
          [films.length - seen, "À découvrir"],
        ].map(([n, label]) =>
          h("div", { class: "stat" }, h("strong", {}, n), label),
        ),
      ),
    );
    const quick = h("input", {
      placeholder: "Un titre, un acteur, une saga…",
      "aria-label": "Rechercher dans ma collection",
    });
    main.append(
      h(
        "form",
        {
          class: "search-form",
          onSubmit: (e) => {
            e.preventDefault();
            search.setQuery(quick.value);
            navigate("search");
          },
        },
        quick,
        h("button", { type: "submit", class: "primary" }, "Rechercher"),
      ),
    );
    main.append(
      h(
        "div",
        { class: "tabs" },
        ...Object.entries(categories).map(([value, label]) =>
          button(label, () => {
            filters.category = value;
            search.setQuery("");
            navigate("collection");
          }),
        ),
      ),
    );
    const eligible = films.filter(
      (f) => !f.statuts.includes("vu") && !f.statuts.includes("trouver"),
    );
    main.append(
      h(
        "div",
        { class: "row spread" },
        h("h2", {}, "À regarder"),
        button("Une suggestion", () => {
          if (!eligible.length)
            return notify("Aucun titre disponible à proposer.");
          openDetail(eligible[Math.floor(Math.random() * eligible.length)]);
        }),
      ),
      eligible.length
        ? grid(
            eligible
              .slice(0, 8)
              .map((film) => ({ kind: "local", title: film.titre, film })),
          )
        : h(
            "p",
            { class: "empty" },
            "Ajoute tes premiers titres ou importe ta collection dans Paramètres.",
          ),
    );
    if (eligible.length > 1 && store.state.prefs.suggestedBanner !== false) {
      const track = main.querySelector(".grid");
      track.classList.add("banner");
      let index = 0,
        paused = false;
      const pause = button("Mettre le bandeau en pause", () => {
        paused = !paused;
        pause.textContent = paused
          ? "Reprendre le bandeau"
          : "Mettre le bandeau en pause";
      });
      track.before(pause);
      bannerTimer = setInterval(
        () => {
          if (
            paused ||
            document.hidden ||
            dialog?.open ||
            window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ||
            track.matches(":hover,:focus-within")
          )
            return;
          index = (index + 1) % track.children.length;
          track.scrollTo({
            left:
              track.children[index].offsetLeft - track.children[0].offsetLeft,
            behavior: "smooth",
          });
        },
        Math.max(2, Number(store.state.prefs.suggestedBannerCardSeconds) || 7) *
          1000,
      );
    }
    if (films.length)
      main.append(
        h("h2", {}, "Derniers ajouts"),
        grid(
          filterFilms(films)
            .slice(0, 8)
            .map((film) => ({ kind: "local", title: film.titre, film })),
        ),
      );
  }
  function renderSearch() {
    const query = h("input", {
      value: search.state.query,
      id: "search-query",
      placeholder: "Titre, acteur ou saga…",
      "aria-label": "Recherche",
      autocomplete: "off",
      onInput: (e) => search.setQuery(e.target.value),
    });
    main.append(
      h(
        "form",
        {
          class: "search-form",
          onSubmit: (e) => {
            e.preventDefault();
            search.local();
          },
        },
        query,
        h("button", { type: "submit" }, "Ma collection"),
      ),
    );
    const tabs = {
      multi: "Tout",
      movie: "Films",
      tv: "Séries",
      person: "Personnes",
      collection: "Sagas",
      company: "Studios",
    };
    const tabNodes = Object.entries(tabs).map(([key, label]) =>
      button(
        label,
        () => {
          search.setKind(key);
          for (const b of tabNodes)
            b.classList.toggle("active", b.dataset.kind === key);
        },
        {
          dataset: { kind: key },
          class: search.state.kind === key ? "active" : "",
        },
      ),
    );
    main.append(
      h("div", { class: "tabs", "aria-label": "Type de recherche" }, tabNodes),
    );
    main.append(
      h(
        "div",
        { class: "row" },
        action("Continuer la recherche sur TMDB", () => search.remote(), {
          class: "primary",
          id: "continue-tmdb",
        }),
        button("Ajouter manuellement", () => openEditor()),
      ),
    );
    if (route === "collection")
      main.append(
        h(
          "div",
          { class: "filters" },
          field(
            "Catégorie",
            select({ "": "Toutes", ...categories }, filters.category, (e) => {
              filters.category = e.target.value;
              renderResults();
            }),
          ),
          field(
            "Statut",
            select({ "": "Tous", ...statuses }, filters.status, (e) => {
              filters.status = e.target.value;
              renderResults();
            }),
          ),
          field(
            "Genre",
            h("input", {
              value: filters.genre,
              placeholder: "Tous",
              onInput: (e) => {
                filters.genre = e.target.value;
                renderResults();
              },
            }),
          ),
          field(
            "Tri",
            select(
              {
                recent: "Ajouts récents",
                title: "Titre",
                year: "Année",
                rating: "Ma note",
              },
              filters.sort,
              (e) => {
                filters.sort = e.target.value;
                renderResults();
              },
            ),
          ),
        ),
      );
    const batch = h("div", { id: "batch", class: "row" });
    main.append(batch);
    searchHost = h("section", {
      "aria-live": "polite",
      "aria-label": "Résultats",
    });
    main.append(searchHost);
    renderResults();
    updateBatch();
  }
  function renderResults() {
    if (!searchHost) return;
    const s = search.state;
    let items = s.items;
    if (s.source === "local")
      items =
        route === "collection" && ["multi", "movie", "tv"].includes(s.kind)
          ? filterFilms(store.state.films, { ...filters, query: s.query })
              .filter((f) => s.kind === "multi" || typeOf(f) === s.kind)
              .map((film) => ({ kind: "local", title: film.titre, film }))
          : s.kind === "company"
            ? []
            : localItems(s.query, s.kind);
    const label =
      s.context ||
      (s.source === "local" ? "Dans ma collection" : "Résultats TMDB");
    searchHost.replaceChildren(
      h(
        "div",
        { class: "row spread" },
        h("h2", {}, label),
        h(
          "small",
          {},
          `${items.length} résultat${items.length > 1 ? "s" : ""}`,
        ),
      ),
    );
    if (s.source === "tmdb")
      searchHost.append(
        button("Revenir à ma collection", () => search.local()),
      );
    if (s.loading)
      searchHost.append(
        h("p", { role: "status", class: "notice" }, "Recherche TMDB en cours…"),
      );
    if (s.error)
      searchHost.append(
        h(
          "div",
          { class: "notice error", role: "alert" },
          s.error,
          action("Réessayer", () => search.retry()),
        ),
      );
    if (
      s.source === "tmdb" &&
      items.some((x) => ["movie", "tv"].includes(x.kind))
    )
      searchHost.append(
        action("Ajouter les titres affichés", () => addDisplayed(items)),
      );
    if (
      s.context &&
      items.length &&
      items.every((x) => x.kind === "local") &&
      s.kind === "collection"
    )
      searchHost.append(
        button("Gérer cette saga", () => manageSaga(s.context)),
      );
    if (items.length) searchHost.append(grid(items));
    else if (!s.loading)
      searchHost.append(
        h(
          "p",
          { class: "empty" },
          s.source === "local"
            ? "Aucun résultat ici. Continue la recherche sur TMDB avec le bouton ci-dessus."
            : "Aucun résultat TMDB. Essaie un autre titre ou ajoute une fiche manuellement.",
        ),
      );
    if (s.source === "tmdb" && s.page < s.pages)
      searchHost.append(
        action("Voir les résultats suivants", () => search.next(), {
          disabled: s.loading,
        }),
      );
  }
  function localItems(query, kind) {
    return localSearch(store.state.films, query, kind);
  }
  function updateBatch() {
    const host = document.getElementById("batch");
    if (!host) return;
    host.replaceChildren();
    if (!selected.size) return;
    host.append(
      h("p", {}, selected.size + " sélectionné(s)"),
      button("Modifier la sélection", () => batchEditor()),
      action("Fusionner les doublons", () => mergeSelection()),
      action(
        "Supprimer",
        async () => {
          if (
            !window.confirm(
              "Supprimer les titres sélectionnés ? Une copie de récupération sera conservée.",
            )
          )
            return;
          await store.commit(
            (s) => {
              s.films = s.films.filter((f) => !selected.has(String(f.id)));
            },
            { snapshot: true },
          );
          selected.clear();
          renderResults();
          updateBatch();
        },
        { class: "danger" },
      ),
    );
  }
  function modal(title) {
    dialog?.remove();
    dialog = h("dialog", { "aria-label": title });
    dialog.append(
      button("Fermer", () => dialog.close(), { class: "close" }),
      h("h2", {}, title),
    );
    document.body.append(dialog);
    dialog.showModal();
    return dialog;
  }
  async function addDisplayed(items) {
    const candidates = items.filter(
      (x) =>
        ["movie", "tv"].includes(x.kind) &&
        !store.state.films.some(
          (f) => f.tmdbId === x.id && typeOf(f) === x.kind,
        ),
    );
    if (!candidates.length)
      return notify("Tous les titres affichés sont déjà dans ta collection.");
    if (
      !window.confirm(
        "Ajouter les " +
          candidates.length +
          " titres affichés absents de ta collection ?",
      )
    )
      return;
    let count = 0;
    try {
      for (const item of candidates) {
        await addRemote(item);
        count++;
        notify(count + " / " + candidates.length + " titres ajoutés");
      }
    } catch (e) {
      throw Error(count + " titres ajoutés avant interruption : " + e.message);
    }
  }
  async function mergeSelection() {
    const films = store.state.films.filter((f) => selected.has(String(f.id)));
    if (films.length < 2) throw Error("Sélectionne au moins deux fiches.");
    if (
      !window.confirm(
        "Fusionner ces fiches en conservant le titre et les informations principales de « " +
          films[0].titre +
          " » ? Les éditions, notes, images et visionnages seront regroupés.",
      )
    )
      return;
    await store.commit(
      (s) => {
        const targets = s.films.filter((f) => selected.has(String(f.id))),
          first = targets[0];
        for (const other of targets.slice(1)) {
          for (const field of [
            "statuts",
            "sagas",
            "qualites",
            "pays",
            "photos",
          ])
            first[field] = [
              ...new Set([...(first[field] || []), ...(other[field] || [])]),
            ];
          for (const field of ["visionnages", "editions"])
            first[field] = [...(first[field] || []), ...(other[field] || [])];
          first.noteManuelle = [first.noteManuelle, other.noteManuelle]
            .filter(Boolean)
            .join("\n");
          for (const [key, values] of Object.entries(other.episodesVus || {})) {
            const canonical = key.replace(
              String(other.id) + "_",
              String(first.id) + "_",
            );
            first.episodesVus[canonical] = [
              ...(first.episodesVus[canonical] || []),
              ...values,
            ];
          }
          first.mergedSources = [...(first.mergedSources || []), clone(other)];
        }
        s.films = s.films.filter(
          (f) =>
            !selected.has(String(f.id)) || String(f.id) === String(first.id),
        );
      },
      { snapshot: true },
    );
    selected.clear();
    renderResults();
    updateBatch();
    notify("Fiches fusionnées.");
  }
  function manageSaga(name) {
    const host = modal("Gérer la saga"),
      input = h("input", { value: name }),
      image = h("input", { value: store.state.sagaAffiches[name] || "" });
    host.append(
      field("Nom", input),
      field("Adresse de l’affiche", image),
      action("Enregistrer", async () => {
        const next = input.value.trim();
        if (!next) throw Error("Indique un nom de saga.");
        await store.commit(
          (s) => {
            for (const f of s.films) {
              f.sagas = f.sagas.map((x) => (x === name ? next : x));
              if (f.saga === name) f.saga = next;
            }
            const previous = s.sagaAffiches[name];
            delete s.sagaAffiches[name];
            s.sagaAffiches[next] = safeImage(image.value) || previous || "";
          },
          { snapshot: true },
        );
        dialog.close();
        search.setQuery(next);
        search.setKind("collection");
      }),
      action(
        "Dissocier la saga",
        async () => {
          if (
            !window.confirm(
              "Retirer cette saga des fiches sans supprimer les titres ?",
            )
          )
            return;
          await store.commit(
            (s) => {
              for (const f of s.films) {
                f.sagas = f.sagas.filter((x) => x !== name);
                if (f.saga === name) delete f.saga;
              }
              delete s.sagaAffiches[name];
            },
            { snapshot: true },
          );
          dialog.close();
          search.local();
        },
        { class: "danger" },
      ),
    );
  }
  function batchEditor() {
    const host = modal("Modifier la sélection"),
      saga = h("input", { placeholder: "Saga à ajouter" }),
      genre = h("input", { placeholder: "Genre à ajouter" }),
      status = select({ "": "Ne pas modifier", ...statuses }, ""),
      cat = select({ "": "Ne pas modifier", ...categories }, "");
    host.append(
      h(
        "div",
        { class: "fields" },
        field("Saga", saga),
        field("Genre", genre),
        field("Statut à ajouter", status),
        field("Catégorie", cat),
      ),
      action("Appliquer", async () => {
        await store.commit(
          (s) => {
            for (const f of s.films.filter((f) => selected.has(String(f.id)))) {
              if (saga.value.trim())
                f.sagas = [...new Set([...f.sagas, saga.value.trim()])];
              if (genre.value.trim())
                f.genres = [
                  ...new Set([...list(f.genres), genre.value.trim()]),
                ].join(", ");
              if (status.value)
                f.statuts = [...new Set([...f.statuts, status.value])];
              if (cat.value) f.categorie = cat.value;
            }
          },
          { snapshot: true },
        );
        dialog.close();
        renderResults();
      }),
    );
  }
  async function openItem(item) {
    if (item.kind === "local") return openDetail(item.film);
    if (item.kind === "localSaga") {
      search.state.context = item.title;
      search.state.source = "tmdb";
      search.state.items = item.films.map((film) => ({
        kind: "local",
        title: film.titre,
        film,
      }));
      search.state.pages = 0;
      renderResults();
      return;
    }
    if (item.kind === "person") {
      if (!item.id) {
        search.setQuery(item.title);
        search.setKind("person");
        return search.remote();
      }
      await search.browse("Filmographie · " + item.title, () =>
        tmdb.credits(item.id),
      );
      return;
    }
    if (item.kind === "collection") {
      await search.browse("Saga · " + item.title, async () => {
        const data = await tmdb.collection(item.id);
        return data.items;
      });
      return;
    }
    if (item.kind === "company") {
      await search.browse("Studio · " + item.title, (page) =>
        tmdb.company(item.id, page),
      );
      return;
    }
    const d = await tmdb.details(item.id, item.kind);
    openRemote(d, item.kind);
  }
  async function addRemote(item, data) {
    const found = store.state.films.find(
      (f) => f.tmdbId === item.id && typeOf(f) === item.kind,
    );
    if (found) {
      notify("Ce titre est déjà dans ta collection.");
      return found;
    }
    const detail = data || (await tmdb.details(item.id, item.kind)),
      film = tmdb.toFilm(detail, item.kind);
    await store.commit((s) => {
      if (!s.films.some((f) => identity(f) === identity(film)))
        s.films.push(film);
    });
    notify("Ajouté : " + film.titre);
    renderResults();
    return film;
  }
  function openRemote(data, kind) {
    const host = modal(data.title || data.name),
      film = tmdb.toFilm(data, kind);
    host.append(
      summary(film),
      h("p", {}, film.resume),
      action(
        "Ajouter à ma collection",
        async () => {
          const added = await addRemote({ id: data.id, kind }, data);
          dialog.close();
          openDetail(added);
        },
        { class: "primary" },
      ),
    );
    if (data.credits?.cast?.length)
      host.append(
        h("h3", {}, "Distribution"),
        h(
          "div",
          { class: "chips" },
          data.credits.cast.slice(0, 20).map((p) =>
            button(p.name, () => {
              dialog.close();
              navigate("search");
              search.browse("Filmographie · " + p.name, () =>
                tmdb.credits(p.id),
              );
            }),
          ),
        ),
      );
  }
  function summary(f) {
    return h(
      "div",
      { class: "detail-top" },
      safeImage(f.affichePath)
        ? h("img", { src: safeImage(f.affichePath), alt: f.titre })
        : h("div", {}),
      h(
        "div",
        {},
        h("h2", {}, f.titre),
        h(
          "p",
          { class: "muted" },
          [
            String(f.dateSortie || "").slice(0, 4),
            categories[f.categorie],
            f.duree ? f.duree + " min" : "",
          ]
            .filter(Boolean)
            .join(" · "),
        ),
        h("p", {}, f.genres || ""),
        h("p", {}, f.realisateur || f.createur || ""),
        h("p", {}, f.emplacement ? "Emplacement : " + f.emplacement : ""),
      ),
    );
  }
  function current(id) {
    const f = store.state.films.find((f) => String(f.id) === String(id));
    if (!f) throw Error("Fiche introuvable.");
    return f;
  }
  const changeFilm = (id, fn, options) =>
    store.commit((s) => {
      const f = s.films.find((x) => String(x.id) === String(id));
      if (!f) throw Error("Fiche introuvable.");
      fn(f);
    }, options);
  function openDetail(item) {
    const f = current(item.id),
      host = modal(f.titre);
    host.append(
      summary(f),
      h("p", {}, f.resume || "Pas de résumé."),
      h(
        "div",
        { class: "row" },
        button("Modifier la fiche", () => openEditor(f)),
        action(
          "Supprimer",
          async () => {
            if (!window.confirm("Supprimer « " + f.titre + " » ?")) return;
            await store.commit(
              (s) => {
                s.films = s.films.filter((x) => String(x.id) !== String(f.id));
              },
              { snapshot: true },
            );
            dialog.close();
            render();
          },
          { class: "danger" },
        ),
      ),
    );
    const statusBox = h("div", { class: "chips" });
    for (const [key, label] of Object.entries(statuses))
      statusBox.append(
        action(
          label,
          async () => {
            await changeFilm(f.id, (x) => {
              x.statuts = x.statuts.includes(key)
                ? x.statuts.filter((s) => s !== key)
                : [...x.statuts, key];
              x.statut = x.statuts[0] || "";
              x.estVu = x.statuts.includes("vu");
            });
            openDetail(current(f.id));
          },
          { class: f.statuts.includes(key) ? "active" : "" },
        ),
      );
    host.append(h("h3", {}, "Statuts"), statusBox);
    if (f.trailerKey)
      host.append(
        h(
          "a",
          {
            class: "button",
            href:
              "https://www.youtube.com/watch?v=" +
              encodeURIComponent(f.trailerKey),
            target: "_blank",
            rel: "noopener noreferrer",
          },
          "Bande-annonce",
        ),
      );
    else
      host.append(
        h(
          "a",
          {
            class: "button",
            href:
              "https://www.youtube.com/results?search_query=" +
              encodeURIComponent(f.titre + " bande annonce français"),
            target: "_blank",
            rel: "noopener noreferrer",
          },
          "Chercher la bande-annonce",
        ),
      );
    if (f.noteManuelle) host.append(h("p", {}, f.noteManuelle));
    if (f.releaseNote) host.append(h("p", {}, f.releaseNote));
    host.append(
      h("h3", {}, "Éditions et fichiers"),
      ...(f.editions || []).map((ed, index) =>
        h(
          "div",
          { class: "table-item" },
          h(
            "div",
            {},
            h("strong", {}, ed.label),
            h(
              "p",
              { class: "muted" },
              [
                ed.rawName,
                ...(ed.details || []),
                ...(ed.languages || []),
                ed.emplacement,
              ]
                .filter(Boolean)
                .join(" · "),
            ),
          ),
          button("Modifier", () => editEdition(f.id, index)),
          action("Retirer", async () => {
            if (!window.confirm("Retirer cette édition ?")) return;
            await changeFilm(f.id, (x) => x.editions.splice(index, 1));
            openDetail(current(f.id));
          }),
        ),
      ),
      button("Ajouter une édition", () => editEdition(f.id)),
    );
    host.append(h("h3", {}, "Visionnages"), watchForm(f.id), watchRows(f));
    if (typeOf(f) === "tv" && f.tmdbId)
      host.append(
        action("Charger les saisons et épisodes", () => showSeasons(f)),
      );
    if (f.castingDetails?.length)
      host.append(
        h("h3", {}, "Distribution"),
        h(
          "div",
          { class: "chips" },
          f.castingDetails.map((p) =>
            button(p.name, () => {
              dialog.close();
              navigate("search");
              if (p.id)
                search.browse("Filmographie · " + p.name, () =>
                  tmdb.credits(p.id),
                );
              else {
                search.setQuery(p.name);
                search.setKind("person");
              }
            }),
          ),
        ),
      );
    if (f.sagas.length)
      host.append(
        h("h3", {}, "Sagas"),
        h(
          "div",
          { class: "chips" },
          f.sagas.map((name) =>
            button(name, () => {
              dialog.close();
              search.setQuery(name);
              search.setKind("collection");
              navigate("search");
            }),
          ),
        ),
      );
    host.append(
      h("h3", {}, "Images"),
      h(
        "div",
        { class: "gallery" },
        [f.backdropPath, ...(f.photos || [])]
          .filter(safeImage)
          .map((src) =>
            h("img", { src, alt: "Image de " + f.titre, loading: "lazy" }),
          ),
      ),
      field(
        "Importer des photos",
        h("input", {
          type: "file",
          accept: "image/png,image/jpeg,image/webp",
          multiple: true,
          onChange: (e) => run(() => importPhotos(f.id, e.target.files)),
        }),
      ),
    );
    if (f.tmdbId)
      host.append(
        action("Choisir une affiche TMDB", () => choosePoster(f)),
        action("Choisir un fond TMDB", () => choosePoster(f, true)),
      );
    if (f.photos?.length)
      host.append(button("Gérer les photos", () => managePhotos(f.id)));
  }
  function openEditor(existing) {
    const original = existing ? JSON.stringify(existing) : null;
    const f = clone(existing || newFilm()),
      host = modal(existing ? "Modifier la fiche" : "Ajouter manuellement"),
      form = h("form", { class: "stack" }),
      fields = h("div", { class: "fields" }),
      controls = {};
    const definitions = {
      titre: "Titre",
      titreAlt: "Titre alternatif",
      dateSortie: "Date de sortie / année",
      genres: "Genres",
      sousGenres: "Sous-genres",
      realisateur: "Réalisation",
      producteur: "Production",
      scenariste: "Scénario",
      createur: "Création",
      casting: "Distribution",
      duree: "Durée en minutes",
      emplacement: "Emplacement",
      maNote: "Ma note sur 10",
      affichePath: "Adresse de l’affiche",
      backdropPath: "Adresse du fond",
    };
    for (const [key, label] of Object.entries(definitions)) {
      const input = h("input", {
        value: f[key] ?? "",
        required: key === "titre",
        type: ["duree", "maNote"].includes(key) ? "number" : "text",
        ...(key === "maNote" ? { min: 0, max: 10, step: 0.5 } : {}),
      });
      controls[key] = input;
      fields.append(field(label, input));
    }
    controls.categorie = select(categories, f.categorie);
    fields.append(field("Catégorie", controls.categorie));
    for (const [key, label] of Object.entries({
      sagas: "Sagas (séparées par des virgules)",
      qualites: "Qualités",
      pays: "Pays",
      langues: "Langues",
    })) {
      controls[key] = h("input", { value: list(f[key]).join(", ") });
      fields.append(field(label, controls[key]));
    }
    for (const [key, label] of Object.entries({
      resume: "Résumé",
      noteManuelle: "Notes personnelles",
      releaseNote: "Notes de version",
    })) {
      controls[key] = h("textarea", { value: f[key] || "" });
      fields.append(h("div", { class: "wide" }, field(label, controls[key])));
    }
    form.append(
      fields,
      h("button", { type: "submit", class: "primary" }, "Enregistrer"),
    );
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      run(async () => {
        for (const [key, input] of Object.entries(controls))
          f[key] = ["sagas", "qualites", "pays", "langues"].includes(key)
            ? list(input.value)
            : ["duree", "maNote"].includes(key)
              ? Number(input.value)
              : input.value.trim();
        if (!f.titre) throw Error("Le titre est obligatoire.");
        if (original && JSON.stringify(current(f.id)) !== original)
          throw Error(
            "Cette fiche a changé. Ferme puis rouvre l’éditeur avant de réessayer.",
          );
        await store.commit(
          (s) => {
            const index = s.films.findIndex(
              (x) => String(x.id) === String(f.id),
            );
            if (index >= 0) s.films[index] = f;
            else s.films.push(f);
          },
          { snapshot: !!existing },
        );
        notify("Fiche enregistrée.");
        renderResults();
        openDetail(f);
      }, form.querySelector("[type=submit]"));
    });
    host.append(form);
  }
  function editEdition(id, index) {
    const f = current(id),
      ed = clone(f.editions[index] || editionFromFilename("")),
      host = modal("Édition"),
      inputs = {};
    for (const [key, label] of Object.entries({
      label: "Nom de l’édition",
      rawName: "Nom du fichier",
      details: "Caractéristiques",
      languages: "Langues",
      source: "Source",
      emplacement: "Emplacement",
    })) {
      inputs[key] = h("input", {
        value: Array.isArray(ed[key]) ? ed[key].join(", ") : ed[key] || "",
      });
      host.append(field(label, inputs[key]));
    }
    host.append(
      button("Analyser le nom du fichier", () => {
        const parsed = editionFromFilename(inputs.rawName.value);
        inputs.details.value = parsed.details.join(", ");
        inputs.languages.value = parsed.languages.join(", ");
        if (!inputs.label.value) inputs.label.value = parsed.label;
      }),
      action(
        "Enregistrer",
        async () => {
          for (const key of Object.keys(inputs))
            ed[key] = ["details", "languages"].includes(key)
              ? list(inputs[key].value)
              : inputs[key].value.trim();
          if (!ed.label) throw Error("Indique un nom d’édition.");
          await changeFilm(id, (x) => {
            if (index === undefined) x.editions.push(ed);
            else x.editions[index] = ed;
          });
          openDetail(current(id));
        },
        { class: "primary" },
      ),
    );
  }
  function watchForm(id, episode = null) {
    const date = h("input", {
        type: "date",
        value: new Date().toLocaleDateString("en-CA"),
        required: true,
      }),
      support = h("input", { placeholder: "Télé, cinéma, vidéoprojecteur…" }),
      note = h("input", { placeholder: "Note de visionnage" }),
      form = h("form", { class: "fields" });
    form.append(
      field("Date", date),
      field("Support", support),
      field("Note", note),
      h("button", { type: "submit" }, "Ajouter un visionnage"),
    );
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      run(async () => {
        await changeFilm(id, (x) => {
          const w = {
            date: date.value,
            support: support.value,
            note: note.value,
            termine: true,
            sessions: [],
          };
          if (episode) {
            x.episodesVus[episode] ??= [];
            x.episodesVus[episode].push(w);
          } else {
            x.visionnages.push(w);
            if (!x.statuts.includes("vu")) x.statuts.push("vu");
          }
        });
        episode
          ? notify("Visionnage d’épisode enregistré.")
          : openDetail(current(id));
      }, form.querySelector("button"));
    });
    return form;
  }
  function watchRows(f) {
    return h(
      "div",
      { class: "table-list" },
      watchHistory([f]).map(({ watch, index, episode }) =>
        h(
          "div",
          { class: "table-item" },
          h(
            "div",
            {},
            h("strong", {}, watch.date || "Date inconnue"),
            h(
              "p",
              {},
              [episode, watch.support, watch.note].filter(Boolean).join(" · "),
            ),
            ...(watch.sessions || []).map((s) =>
              h("small", {}, typeof s === "string" ? s : JSON.stringify(s)),
            ),
          ),
          button(watch.termine === false ? "Terminer" : "Reprendre", () =>
            run(async () => {
              await changeFilm(f.id, (x) => {
                const row = episode
                  ? x.episodesVus[episode][index]
                  : x.visionnages[index];
                row.termine = row.termine === false;
                row.sessions ??= [];
                row.sessions.push({ date: new Date().toISOString() });
              });
              openDetail(current(f.id));
            }),
          ),
          action("Retirer", async () => {
            if (!window.confirm("Retirer ce visionnage ?")) return;
            await changeFilm(f.id, (x) =>
              (episode ? x.episodesVus[episode] : x.visionnages).splice(
                index,
                1,
              ),
            );
            openDetail(current(f.id));
          }),
        ),
      ),
    );
  }
  async function showSeasons(f) {
    const data = await tmdb.details(f.tmdbId, "tv"),
      host = modal("Saisons · " + f.titre),
      content = h("div");
    host.append(
      h(
        "div",
        { class: "tabs" },
        (data.seasons || []).map((s) =>
          action(s.name, async () => {
            const detail = await tmdb.season(f.tmdbId, s.season_number);
            content.replaceChildren(h("h3", {}, s.name));
            const quality = h("input", {
              value:
                current(f.id).saisonQualites?.["s" + s.season_number] || "",
              placeholder: "Qualité de cette saison",
            });
            content.append(
              field("Qualité de la saison", quality),
              action("Enregistrer la qualité", () =>
                changeFilm(f.id, (x) => {
                  x.saisonQualites ??= {};
                  x.saisonQualites["s" + s.season_number] = quality.value;
                }),
              ),
            );
            for (const ep of detail.episodes || []) {
              const key =
                String(f.id) +
                "_s" +
                s.season_number +
                "_e" +
                ep.episode_number;
              content.append(
                h(
                  "details",
                  {},
                  h(
                    "summary",
                    {},
                    ep.episode_number +
                      " · " +
                      ep.name +
                      " — " +
                      (current(f.id).episodesVus[key]?.length || 0) +
                      " visionnage(s)",
                  ),
                  h("p", {}, ep.overview || ""),
                  watchForm(f.id, key),
                ),
              );
            }
          }),
        ),
      ),
      content,
    );
  }
  async function importPhotos(id, files) {
    const photos = [];
    for (const file of files) {
      if (
        !/^image\/(png|jpeg|webp)$/.test(file.type) ||
        file.size > 8 * 1024 * 1024
      )
        throw Error("Choisis des images PNG, JPEG ou WebP de moins de 8 Mo.");
      photos.push(
        await new Promise((resolve, reject) => {
          const reader = new window.FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }),
      );
    }
    await changeFilm(id, (f) => {
      f.photos = [...(f.photos || []), ...photos];
    });
    openDetail(current(id));
  }
  async function choosePoster(f, backdrop = false) {
    const data = await tmdb.details(f.tmdbId, typeOf(f)),
      host = modal(backdrop ? "Choisir un fond" : "Choisir une affiche");
    host.append(
      h(
        "div",
        { class: "grid" },
        (data.images?.[backdrop ? "backdrops" : "posters"] || []).map((p) =>
          poster(imagePath(p.file_path), f.titre, () =>
            run(async () => {
              await changeFilm(
                f.id,
                (x) =>
                  (x[backdrop ? "backdropPath" : "affichePath"] = imagePath(
                    p.file_path,
                    backdrop ? "original" : "w500",
                  )),
              );
              openDetail(current(f.id));
            }),
          ),
        ),
      ),
    );
  }
  function managePhotos(id) {
    const f = current(id),
      host = modal("Gérer les photos");
    host.append(
      h(
        "div",
        { class: "grid" },
        (f.photos || []).map((src, index) =>
          h(
            "div",
            {},
            safeImage(src)
              ? h("img", { class: "poster", src, alt: "Photo" })
              : null,
            action("Utiliser comme affiche", async () => {
              await changeFilm(id, (x) => (x.affichePath = src));
              openDetail(current(id));
            }),
            action("Retirer", async () => {
              if (!window.confirm("Retirer cette photo ?")) return;
              await changeFilm(id, (x) => x.photos.splice(index, 1), {
                snapshot: true,
              });
              managePhotos(id);
            }),
          ),
        ),
      ),
    );
  }
  function renderHistory() {
    main.append(
      field(
        "Ordre",
        select(
          { desc: "Plus récents", asc: "Plus anciens" },
          historySort,
          (e) => {
            historySort = e.target.value;
            render();
          },
        ),
      ),
    );
    const rows = watchHistory(store.state.films);
    if (historySort === "asc") rows.reverse();
    main.append(
      rows.length
        ? h(
            "div",
            { class: "table-list" },
            rows.map(({ film, watch, episode }) =>
              h(
                "div",
                { class: "table-item" },
                h(
                  "div",
                  {},
                  h("strong", {}, film.titre),
                  h(
                    "p",
                    { class: "muted" },
                    [
                      watch.date,
                      episode,
                      watch.support,
                      watch.termine === false ? "En cours" : "",
                    ]
                      .filter(Boolean)
                      .join(" · "),
                  ),
                ),
                button("Ouvrir", () => openDetail(film)),
              ),
            ),
          )
        : h(
            "p",
            { class: "empty" },
            "Aucun visionnage enregistré. Ajoute-en depuis une fiche.",
          ),
    );
  }
  function renderNotes() {
    main.append(
      action(
        "Nouvelle note",
        async () => {
          await store.commit((s) =>
            s.notes.push({
              id: uid(),
              type: "text",
              content: "",
              created: Date.now(),
            }),
          );
          render();
        },
        { class: "primary" },
      ),
    );
    store.state.notes.forEach((note, index) => {
      const panel = h("section", { class: "panel" });
      const write = (fn) => store.commit((s) => fn(s.notes[index]));
      panel.append(
        h(
          "div",
          { class: "row" },
          action("↑", async () => {
            if (index === 0) return;
            await store.commit((s) => {
              [s.notes[index - 1], s.notes[index]] = [
                s.notes[index],
                s.notes[index - 1],
              ];
            });
            render();
          }),
          action("↓", async () => {
            if (index === store.state.notes.length - 1) return;
            await store.commit((s) => {
              [s.notes[index + 1], s.notes[index]] = [
                s.notes[index],
                s.notes[index + 1],
              ];
            });
            render();
          }),
          action(
            note.type === "checklist" ? "Texte" : "Liste à cocher",
            async () => {
              await write((n) => {
                if (n.type === "checklist") {
                  n.content = (n.items || [])
                    .map((x) => (x.checked ? "✓ " : "") + x.text)
                    .join("\n");
                  n.type = "text";
                } else {
                  n.items = String(n.content || "")
                    .split("\n")
                    .filter(Boolean)
                    .map((text) => ({ text, checked: false }));
                  n.type = "checklist";
                }
              });
              render();
            },
          ),
          action(
            "Supprimer",
            async () => {
              if (!window.confirm("Supprimer cette note ?")) return;
              await store.commit((s) => s.notes.splice(index, 1), {
                snapshot: true,
              });
              render();
            },
            { class: "danger" },
          ),
        ),
      );
      if (note.type === "checklist") {
        for (const [i, item] of (note.items || []).entries())
          panel.append(
            h(
              "div",
              { class: "row" },
              h("input", {
                type: "checkbox",
                checked: item.checked,
                "aria-label": "Cocher " + item.text,
                onChange: (e) =>
                  run(() =>
                    write((n) => (n.items[i].checked = e.target.checked)),
                  ),
              }),
              h("input", {
                value: item.text,
                "aria-label": "Texte de la tâche",
                onChange: (e) =>
                  run(() => write((n) => (n.items[i].text = e.target.value))),
              }),
              action("Retirer", async () => {
                await write((n) => n.items.splice(i, 1));
                render();
              }),
            ),
          );
        panel.append(
          action("Ajouter une tâche", async () => {
            await write((n) => {
              n.items ??= [];
              n.items.push({ text: "", checked: false });
            });
            render();
          }),
        );
      } else
        panel.append(
          h("textarea", {
            value: note.content || "",
            "aria-label": "Texte de la note",
            onChange: (e) =>
              run(() => write((n) => (n.content = e.target.value))),
          }),
        );
      main.append(panel);
    });
  }
  function renderGoogle() {
    if (!googleHost) return;
    const s = session.state;
    googleHost.replaceChildren(
      h("h2", {}, "Google Drive"),
      h("p", {}, s.message),
    );
    if (s.account)
      googleHost.append(
        h("strong", {}, s.account.name),
        h("p", {}, s.account.email),
      );
    if (s.status === "connected")
      googleHost.append(
        h(
          "div",
          { class: "row" },
          action("Sauvegarder", async () => {
            if (
              !window.confirm(
                "Sauvegarder cette collection, les notes et les réglages sur Google Drive ? Le contenu de la sauvegarde sera remplacé.",
              )
            )
              return;
            await sync.save(true);
          }),
          action("Charger", async () => {
            if (
              !window.confirm(
                "Remplacer les données locales par la sauvegarde Google ? Une copie locale sera conservée.",
              )
            )
              return;
            await sync.load(false);
            render();
          }),
          action("Fusionner", async () => {
            if (
              !window.confirm(
                "Fusionner les ajouts des deux collections ? Les fiches locales seront conservées en cas de doublon.",
              )
            )
              return;
            await sync.load(true);
            render();
          }),
          action("Déconnecter", () => session.logout()),
        ),
      );
    else {
      const email = h("input", {
        type: "email",
        value: session.preferredEmail || "",
        autocomplete: "email",
        placeholder: "ton.adresse@gmail.com",
        "aria-label": "Compte Google souhaité",
        onChange: (e) => session.setEmail(e.target.value),
      });
      googleHost.append(
        field("Compte Google souhaité (facultatif)", email),
        action(
          s.status === "authorizing"
            ? "Connexion en cours…"
            : "Se connecter avec Google",
          () => session.signIn(email.value),
          {
            class: "primary",
            disabled: !s.ready || s.status === "authorizing",
          },
        ),
        s.status === "authorizing"
          ? button("Annuler la connexion", () => session.cancelSignIn())
          : action("Vérifier la connexion", () => session.check()),
      );
      if (!s.ready)
        googleHost.append(
          action("Recharger le module Google", () => session.prepare()),
        );
    }
    settingsStatus = h("p", { class: "muted" }, syncMessage);
    googleHost.append(settingsStatus);
    if (store.state.sync.lastSaved)
      googleHost.append(
        h(
          "small",
          {},
          "Dernière sauvegarde : " +
            new Date(store.state.sync.lastSaved).toLocaleString("fr-FR"),
        ),
      );
  }
  function renderSettings() {
    googleHost = h("section", { class: "panel", id: "google-settings" });
    main.append(googleHost);
    renderGoogle();
    const prefs = store.state.prefs,
      appearance = h("section", { class: "panel" }, h("h2", {}, "Affichage"));
    const pref = (key, value) =>
      run(async () => {
        await store.commit((s) => (s.prefs[key] = value));
        applyPrefs();
      });
    appearance.append(
      h(
        "div",
        { class: "fields" },
        field(
          "Thème",
          select(
            { dark: "Sombre", light: "Clair" },
            prefs.theme || "dark",
            (e) => pref("theme", e.target.value),
          ),
        ),
        field(
          "Colonnes",
          select(
            { 0: "Automatique", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6" },
            String(prefs.cols || 0),
            (e) => pref("cols", Number(e.target.value)),
          ),
        ),
        field(
          "Taille du texte",
          h("input", {
            type: "number",
            min: 14,
            max: 24,
            value: prefs.fontSize || 16,
            onChange: (e) =>
              pref(
                "fontSize",
                Math.max(14, Math.min(24, Number(e.target.value) || 16)),
              ),
          }),
        ),
      ),
    );
    appearance.append(
      field(
        "Défilement des suggestions",
        select(
          { yes: "Activé", no: "Désactivé" },
          prefs.suggestedBanner === false ? "no" : "yes",
          (e) => pref("suggestedBanner", e.target.value === "yes"),
        ),
      ),
      field(
        "Secondes par affiche dans le bandeau",
        h("input", {
          type: "number",
          min: 2,
          max: 60,
          value: prefs.suggestedBannerCardSeconds || 7,
          onChange: (e) =>
            pref(
              "suggestedBannerCardSeconds",
              Math.max(2, Math.min(60, Number(e.target.value) || 7)),
            ),
        }),
      ),
    );
    main.append(appearance);
    const key = h("input", {
      type: "password",
      value: prefs.apiKey || DEFAULT_TMDB_KEY,
      autocomplete: "off",
      "aria-label": "Clé TMDB",
    });
    main.append(
      h(
        "section",
        { class: "panel" },
        h("h2", {}, "Recherche TMDB"),
        field("Clé API TMDB", key),
        action("Enregistrer et tester", async () => {
          await store.commit((s) => (s.prefs.apiKey = key.value.trim()));
          await tmdb.get("/configuration");
          notify("Clé TMDB validée.");
        }),
      ),
    );
    const file = h("input", {
      type: "file",
      accept: ".json,application/json",
      onChange: (e) =>
        run(async () => {
          const f = e.target.files?.[0];
          if (!f) return;
          if (f.size > 40 * 1024 * 1024)
            throw Error("Le fichier dépasse 40 Mo.");
          const data = JSON.parse(await f.text());
          if (
            !window.confirm(
              "Importer cette sauvegarde et remplacer les données locales ?",
            )
          )
            return;
          await store.import(data);
          sync.blocked = true;
          applyPrefs();
          notify("Sauvegarde importée.");
          render();
        }),
    });
    main.append(
      h(
        "section",
        { class: "panel" },
        h("h2", {}, "Sauvegardes et récupération"),
        h(
          "div",
          { class: "row" },
          button("Exporter toutes mes données", () =>
            download(
              document,
              store.bundle(),
              "MyCinebox-sauvegarde-complete.json",
            ),
          ),
          action("Copies de récupération", async () => {
            const rows = await store.snapshots(),
              host = modal("Copies de récupération");
            if (!rows.length)
              host.append(h("p", {}, "Aucune copie pour le moment."));
            for (const row of rows.reverse())
              host.append(
                h(
                  "div",
                  { class: "table-item" },
                  h(
                    "span",
                    {},
                    new Date(row.date).toLocaleString("fr-FR") +
                      " · " +
                      row.data.films.length +
                      " titres",
                  ),
                  action("Restaurer", async () => {
                    if (!window.confirm("Restaurer cette copie ?")) return;
                    await store.restore(row.id);
                    sync.blocked = true;
                    dialog.close();
                    render();
                  }),
                ),
              );
          }),
        ),
        field("Importer une sauvegarde JSON", file),
        h(
          "p",
          { class: "muted" },
          "La sauvegarde complète contient les titres, les notes et les réglages. Les dix dernières copies de récupération sont conservées sur cet appareil.",
        ),
      ),
    );
    main.append(
      h(
        "p",
        { class: "muted" },
        "Version 3.1 · GitHub Pages · Connexion Google sans serveur.",
      ),
    );
  }
  const unsubscribe = store.subscribe(() => sync.schedule());
  let lastAccount = null;
  const unsubSession = session.subscribe((s) => {
    accountStatus.textContent =
      s.status === "connected" ? "Google connecté" : "Collection locale";
    renderGoogle();
    if (s.status === "connected" && lastAccount !== s.account.id) {
      lastAccount = s.account.id;
      sync.inspect().then(() => {
        renderResults();
        sync.schedule();
      });
    }
    if (s.status !== "connected") {
      lastAccount = null;
      sync.blocked = true;
      sync.dispose();
    }
  });
  const onPop = () => navigate(window.location.hash.slice(1) || "home", false),
    onOnline = () => session.check(),
    onVisible = () => {
      if (!document.hidden) session.check();
    };
  window.addEventListener("popstate", onPop);
  window.addEventListener("online", onOnline);
  document.addEventListener("visibilitychange", onVisible);
  navigate(window.location.hash.slice(1) || "home", false);
  const authError = new URLSearchParams(window.location.search).get("auth");
  if (authError) {
    notify(
      "La connexion Google n’a pas abouti. Tu peux réessayer dans Paramètres.",
    );
    window.history.replaceState(
      {},
      "",
      window.location.pathname + window.location.hash,
    );
  }
  session.prepare?.();
  session.check();
  return {
    store,
    search,
    session,
    sync,
    navigate,
    dispose() {
      unsubscribe();
      unsubSession();
      sync.dispose();
      session.dispose?.();
      clearTimeout(toastTimer);
      clearInterval(bannerTimer);
      search.cancel();
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisible);
      dialog?.remove();
      store.close();
    },
  };
}
import { localSearch } from "./model.js";
