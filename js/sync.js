import { validateBundle, mergeFilms, clone } from "./model.js";
const NAME = "mycinebox_complete_v3.json",
  LEGACY = "videotheque_backup.json";
const comparable = (data) =>
  JSON.stringify({
    films: data.films,
    notes: data.notes,
    prefs: data.prefs,
    sagaAffiches: data.sagaAffiches,
  });
export class Sync {
  constructor(store, session, notify = () => {}) {
    this.store = store;
    this.session = session;
    this.notify = notify;
    this.blocked = true;
    this.busy = false;
    this.remote = null;
    this.etag = null;
  }
  assertAccount(account) {
    if (
      this.session.state.status !== "connected" ||
      this.session.state.account?.id !== account
    )
      throw Error("Le compte Google a changé. Relance la synchronisation.");
  }
  apply(data, account) {
    const bundle = validateBundle(data);
    return this.store.commit(
      (state) => {
        this.assertAccount(account);
        Object.assign(state, bundle);
      },
      { snapshot: true },
    );
  }
  async find(name) {
    const query = new URLSearchParams({
      q: `name='${name}' and trashed=false`,
      fields: "files(id,name,modifiedTime)",
      orderBy: "modifiedTime desc",
      pageSize: "100",
    });
    const r = await this.session.drive("/drive/v3/files?" + query);
    return (await r.json()).files?.[0] || null;
  }
  async read(file) {
    const r = await this.session.drive(
      "/drive/v3/files/" + file.id + "?alt=media",
    );
    return {
      data: validateBundle(await r.json()),
      etag: r.headers.get("etag"),
    };
  }
  async inspect() {
    if (this.busy) return;
    this.busy = true;
    this.blocked = true;
    try {
      const owner = this.store.state.sync.owner,
        account = this.session.state.account.id;
      if (owner && owner !== account) {
        this.notify(
          "Compte différent : charge ou fusionne sa sauvegarde avant toute écriture.",
        );
        return;
      }
      this.remote = (await this.find(NAME)) || (await this.find(LEGACY));
      if (this.remote) {
        const { data, etag } = await this.read(this.remote);
        this.assertAccount(account);
        this.etag = etag;
        if (
          !this.store.state.films.length &&
          !this.store.state.notes.length &&
          !this.store.state.sync.dirty
        ) {
          await this.apply(data, account);
        } else if (
          comparable({ ...this.store.bundle(), ...data }) !==
          comparable(this.store.bundle())
        ) {
          this.notify(
            "Collections différentes : choisis Charger, Fusionner ou Sauvegarder.",
          );
          return;
        }
        if (this.remote.name === LEGACY) {
          this.notify(
            "Ancienne sauvegarde trouvée. Une sauvegarde complète peut maintenant être créée.",
          );
          this.remote = null;
          this.etag = null;
        }
      }
      await this.store.commit(
        (s) => {
          this.assertAccount(account);
          s.sync.owner = account;
        },
        { dirty: false },
      );
      this.blocked = false;
      this.notify("Google Drive prêt.");
    } catch (e) {
      this.notify(e.message);
    } finally {
      this.busy = false;
    }
  }
  schedule() {
    clearTimeout(this.timer);
    if (
      !this.blocked &&
      this.session.state.status === "connected" &&
      this.store.state.sync.dirty
    )
      this.timer = setTimeout(
        () => this.save(false).catch((e) => this.notify(e.message)),
        2500,
      );
  }
  async save(manual = false) {
    if (this.busy) throw Error("Une synchronisation est déjà en cours.");
    if (this.blocked && !manual) return;
    this.busy = true;
    clearTimeout(this.timer);
    const account = this.session.state.account?.id;
    const snapshot = this.store.bundle(),
      revision = this.store.state.revision;
    try {
      const file = await this.find(NAME);
      let etag = this.etag;
      if (file) {
        const latest = await this.read(file);
        if (
          !manual &&
          (!this.remote ||
            this.remote.id !== file.id ||
            latest.etag !== etag ||
            !etag)
        ) {
          this.blocked = true;
          throw Error(
            "Drive a changé ou sa version est inconnue. Vérifie la sauvegarde dans Paramètres.",
          );
        }
        etag = latest.etag;
      }
      this.assertAccount(account);
      let response;
      if (file) {
        response = await this.session.drive(
          "/upload/drive/v3/files/" +
            file.id +
            "?uploadType=media&fields=id,name,modifiedTime",
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              ...(etag ? { "If-Match": etag } : {}),
            },
            body: JSON.stringify(snapshot),
          },
        );
      } else {
        const boundary = "mc-" + crypto.randomUUID();
        response = await this.session.drive(
          "/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime",
          {
            method: "POST",
            headers: {
              "Content-Type": "multipart/related; boundary=" + boundary,
            },
            body: `--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify({ name: NAME, mimeType: "application/json" })}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(snapshot)}\r\n--${boundary}--`,
          },
        );
      }
      this.remote = await response.json();
      const verified = await this.read(this.remote);
      this.assertAccount(account);
      this.etag = verified.etag;
      if (comparable(verified.data) !== comparable(snapshot)) {
        this.blocked = true;
        throw Error("Le contenu distant a changé pendant la sauvegarde.");
      }
      await this.store.commit(
        (s) => {
          if (s.revision === revision) s.sync.dirty = false;
          this.assertAccount(account);
          s.sync.owner = account;
          s.sync.lastSaved = new Date().toISOString();
        },
        { dirty: false },
      );
      this.blocked = !this.etag;
      this.notify(
        this.etag
          ? "Sauvegarde complète confirmée."
          : "Sauvegarde confirmée. La sauvegarde automatique est suspendue car Drive ne fournit pas de version vérifiable.",
      );
    } catch (e) {
      this.blocked = true;
      throw e;
    } finally {
      this.busy = false;
      if (!this.blocked) this.schedule();
    }
  }
  async load(merge = false) {
    const account = this.session.state.account?.id;
    if (this.busy) throw Error("Une synchronisation est déjà en cours.");
    this.busy = true;
    this.blocked = true;
    try {
      const file = (await this.find(NAME)) || (await this.find(LEGACY));
      if (!file) throw Error("Aucune sauvegarde trouvée.");
      const { data, etag } = await this.read(file);
      const next = merge
        ? {
            ...data,
            films: mergeFilms(this.store.state.films, data.films),
            notes: [...(data.notes || []), ...this.store.state.notes].filter(
              (x, i, a) =>
                a.findIndex((y) => JSON.stringify(y) === JSON.stringify(x)) ===
                i,
            ),
            prefs: { ...(data.prefs || {}), ...this.store.state.prefs },
            sagaAffiches: {
              ...(data.sagaAffiches || {}),
              ...this.store.state.sagaAffiches,
            },
          }
        : data;
      await this.apply(clone(next), account);
      await this.store.commit(
        (s) => {
          this.assertAccount(account);
          s.sync.owner = account;
          s.sync.dirty = merge;
        },
        { dirty: false },
      );
      this.remote = file.name === NAME ? file : null;
      this.etag = file.name === NAME ? etag : null;
      this.blocked = false;
      this.notify(
        merge ? "Collections fusionnées localement." : "Sauvegarde chargée.",
      );
    } finally {
      this.busy = false;
    }
  }
  dispose() {
    clearTimeout(this.timer);
  }
}
