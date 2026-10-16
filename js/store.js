import { clone, validateBundle } from "./model.js";
const request = (req) =>
  new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
const done = (tx) =>
  new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onabort = tx.onerror = () =>
      reject(tx.error || Error("Écriture annulée."));
  });
const decode = (value, fallback) =>
  value === null ? fallback : JSON.parse(value);
export class Store {
  constructor({
    indexedDB = globalThis.indexedDB,
    localStorage = globalThis.localStorage,
  } = {}) {
    this.idb = indexedDB;
    this.local = localStorage;
    this.listeners = new Set();
    this.queue = Promise.resolve();
    this.state = null;
  }
  async open() {
    if (!this.idb)
      throw Error(
        "Le stockage local est indisponible. Autorise le stockage de ce site pour ouvrir ta collection.",
      );
    const req = this.idb.open("mycinebox_v3", 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore("state");
      req.result.createObjectStore("recovery", {
        keyPath: "id",
        autoIncrement: true,
      });
    };
    this.db = await request(req);
    this.state = await request(
      this.db.transaction("state").objectStore("state").get("main"),
    );
    if (!this.state) {
      const legacy = await this.readLegacy();
      this.state = {
        ...legacy,
        revision: 0,
        sync: { dirty: false, owner: "", etag: null, file: null },
        created: Date.now(),
      };
      const tx = this.db.transaction("state", "readwrite");
      const complete = done(tx);
      tx.objectStore("state").add(this.state, "main");
      try {
        await complete;
      } catch (e) {
        const existing = await request(
          this.db.transaction("state").objectStore("state").get("main"),
        );
        if (!existing) throw e;
        this.state = existing;
      }
    }
    return this.state;
  }
  async readLegacy() {
    let films;
    let source;
    // Opening the legacy database never overwrites its stores.
    const req = this.idb.open("mycinebox_data");
    req.onupgradeneeded = () => {};
    const db = await request(req);
    try {
      if (db.objectStoreNames.contains("kv"))
        source = await request(
          db.transaction("kv").objectStore("kv").get("films"),
        );
    } finally {
      db.close();
    }
    if (source?.contenu != null) films = JSON.parse(source.contenu);
    else {
      const primary = this.local.getItem("videotheque_films");
      films = decode(
        primary ?? this.local.getItem("videotheque_films_backup"),
        [],
      );
    }
    return {
      prefs: decode(this.local.getItem("videotheque_prefs"), {}),
      notes: decode(this.local.getItem("videotheque_notes_v2"), []),
      sagaAffiches: decode(this.local.getItem("sagaAffiches"), {}),
      ...validateBundle(films),
    };
  }
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
  emit() {
    for (const fn of this.listeners) fn(this.state);
  }
  commit(change, { dirty = true, snapshot = false } = {}) {
    const job = this.queue
      .catch(() => {})
      .then(async () => {
        const before = this.state,
          next = clone(before);
        change(next);
        next.revision = before.revision + 1;
        if (dirty) next.sync.dirty = true;
        const tx = this.db.transaction(["state", "recovery"], "readwrite"),
          complete = done(tx),
          store = tx.objectStore("state");
        const read = store.get("main");
        let conflict = false;
        read.onsuccess = () => {
          if (read.result?.revision !== before.revision) {
            conflict = true;
            tx.abort();
            return;
          }
          if (snapshot)
            tx.objectStore("recovery").add({
              date: Date.now(),
              data: this.bundle(before),
            });
          store.put(next, "main");
        };
        try {
          await complete;
        } catch (e) {
          if (conflict) {
            this.state = await request(
              this.db.transaction("state").objectStore("state").get("main"),
            );
            this.emit();
            throw Error(
              "La collection a changé dans un autre onglet. Réessaie ton action.",
            );
          }
          throw Error("Sauvegarde locale impossible : " + e.message);
        }
        this.state = next;
        this.emit();
        if (snapshot) await this.prune().catch(() => {});
        return next;
      });
    this.queue = job;
    return job;
  }
  bundle(state = this.state) {
    return {
      format: "mycinebox-full",
      version: 3,
      date: new Date().toISOString(),
      films: clone(state.films),
      prefs: clone(state.prefs),
      notes: clone(state.notes),
      sagaAffiches: clone(state.sagaAffiches),
    };
  }
  async prune() {
    const tx = this.db.transaction("recovery", "readwrite"),
      complete = done(tx),
      store = tx.objectStore("recovery");
    const keys = store.getAllKeys();
    keys.onsuccess = () =>
      keys.result.slice(0, -10).forEach((key) => store.delete(key));
    await complete;
  }
  async snapshots() {
    return request(
      this.db.transaction("recovery").objectStore("recovery").getAll(),
    );
  }
  async restore(id) {
    const row = await request(
      this.db.transaction("recovery").objectStore("recovery").get(Number(id)),
    );
    if (!row) throw Error("Copie de récupération absente.");
    return this.import(row.data);
  }
  import(data) {
    const validated = validateBundle(data);
    return this.commit((state) => Object.assign(state, validated), {
      snapshot: true,
    });
  }
  async reload() {
    await this.queue.catch(() => {});
    this.state = await request(
      this.db.transaction("state").objectStore("state").get("main"),
    );
    this.emit();
  }
  close() {
    this.db?.close();
  }
}
