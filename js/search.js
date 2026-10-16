import { localSearch } from "./model.js";
// A single controller owns the query for every entry point and every search tab.
export class Search {
  constructor(getFilms, tmdb, onChange = () => {}) {
    this.getFilms = getFilms;
    this.tmdb = tmdb;
    this.onChange = onChange;
    this.sequence = 0;
    this.state = {
      query: "",
      kind: "multi",
      source: "local",
      items: [],
      page: 1,
      pages: 0,
      loading: false,
      error: "",
      context: "",
    };
  }
  publish() {
    this.onChange(this.state);
  }
  cancel() {
    this.sequence++;
    this.controller?.abort();
  }
  setQuery(query) {
    this.cancel();
    this.browseLoader = null;
    this.lastRequest = null;
    Object.assign(this.state, {
      query,
      source: "local",
      loading: false,
      error: "",
      page: 1,
      pages: 0,
      context: "",
    });
    this.state.items = localSearch(this.getFilms(), query, this.state.kind);
    this.publish();
  }
  setKind(kind) {
    this.state.kind = kind;
    this.setQuery(this.state.query);
  }
  local() {
    this.setQuery(this.state.query);
  }
  async remote(page = 1) {
    this.browseLoader = null;
    this.lastRequest = () => this.remote(page);
    if (!this.state.query.trim()) {
      this.state.error = "Saisis un titre, un nom ou une saga.";
      this.publish();
      return;
    }
    this.cancel();
    const sequence = this.sequence;
    this.controller = new AbortController();
    const { query, kind } = this.state;
    Object.assign(this.state, {
      source: "tmdb",
      loading: true,
      error: "",
      context: "",
    });
    if (page === 1) this.state.items = [];
    this.publish();
    try {
      const result = await this.tmdb.search(
        query.trim(),
        kind,
        page,
        this.controller.signal,
      );
      if (sequence !== this.sequence) return;
      Object.assign(this.state, {
        items:
          page === 1 ? result.items : [...this.state.items, ...result.items],
        page: result.page,
        pages: result.pages,
      });
    } catch (e) {
      if (sequence === this.sequence)
        this.state.error = e.message || "Recherche impossible.";
    } finally {
      if (sequence === this.sequence) {
        this.state.loading = false;
        this.publish();
      }
    }
  }
  next() {
    return this.browseLoader
      ? this.browse(this.state.context, this.browseLoader, this.state.page + 1)
      : this.remote(this.state.page + 1);
  }
  retry() {
    return this.lastRequest ? this.lastRequest() : this.remote();
  }
  async browse(label, loader, page = 1) {
    this.cancel();
    this.lastRequest = () => this.browse(label, loader, page);
    this.browseLoader = loader;
    const sequence = this.sequence;
    Object.assign(this.state, {
      source: "tmdb",
      loading: true,
      error: "",
      context: label,
    });
    if (page === 1) Object.assign(this.state, { items: [], page: 1, pages: 0 });
    this.publish();
    try {
      const result = await loader(page);
      if (sequence === this.sequence) {
        const items = Array.isArray(result) ? result : result.items;
        this.state.items = page === 1 ? items : [...this.state.items, ...items];
        this.state.page = page;
        this.state.pages = Array.isArray(result) ? 1 : result.pages;
      }
    } catch (e) {
      if (sequence === this.sequence) this.state.error = e.message;
    } finally {
      if (sequence === this.sequence) {
        this.state.loading = false;
        this.publish();
      }
    }
  }
}
