import { GOOGLE_CLIENT_ID } from "./config.js";
export const TOKEN_KEY = "mycinebox_google_token_v3";
const EMAIL_KEY = "mycinebox_google_email_v3";
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const SCOPES = "openid email profile " + DRIVE_SCOPE;
export function loadGoogle(window) {
  if (window?.google?.accounts?.oauth2)
    return Promise.resolve(window.google.accounts.oauth2);
  return new Promise((resolve, reject) => {
    const document = window?.document;
    if (!document) return reject(Error("Navigateur indisponible."));
    document.getElementById("google-identity-client")?.remove();
    const script = document.createElement("script");
    script.id = "google-identity-client";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    const timer = setTimeout(
      () =>
        finish(
          Error("Le module Google ne répond pas. Réessaie son chargement."),
        ),
      15000,
    );
    function finish(error) {
      clearTimeout(timer);
      script.onload = script.onerror = null;
      if (error) {
        script.remove();
        reject(error);
      } else resolve(window.google.accounts.oauth2);
    }
    script.onload = () =>
      window.google?.accounts?.oauth2
        ? finish()
        : finish(Error("Module Google indisponible."));
    script.onerror = () =>
      finish(Error("Le module Google n’a pas pu être chargé. Réessaie."));
    document.head.append(script);
  });
}
export class Session {
  constructor(
    fetcher = globalThis.fetch,
    {
      window = globalThis.window,
      storage = globalThis.localStorage,
      loader = loadGoogle,
      now = () => Date.now(),
      clientId = GOOGLE_CLIENT_ID,
      timeout = 90000,
    } = {},
  ) {
    this.fetch = fetcher;
    this.window = window;
    this.storage = storage;
    this.loader = loader;
    this.now = now;
    this.clientId = clientId;
    this.timeout = timeout;
    this.listeners = new Set();
    this.epoch = 0;
    this.token = null;
    this.storageChanged = (event) => {
      if (event.key === TOKEN_KEY) {
        this.epoch++;
        this.token = null;
        if (event.newValue) this.check();
        else {
          clearTimeout(this.expiryTimer);
          this.set({
            status: "disconnected",
            account: null,
            message: "Déconnecté dans un autre onglet.",
          });
        }
      }
    };
    this.window?.addEventListener("storage", this.storageChanged);
    this.state = {
      status: "checking",
      ready: false,
      message: "Vérification de l’accès Google…",
      account: null,
    };
    try {
      this.preferredEmail = this.storage?.getItem(EMAIL_KEY) || "";
    } catch {
      this.preferredEmail = "";
    }
  }
  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  set(value) {
    Object.assign(this.state, value);
    for (const fn of this.listeners) fn(this.state);
  }
  async prepare() {
    if (this.oauth) return true;
    if (this.preparing) return this.preparing;
    this.preparing = (async () => {
      try {
        this.oauth = await this.loader(this.window);
        this.set({ ready: true });
        return true;
      } catch (e) {
        this.set({
          ready: false,
          ...(this.state.status === "connected" ? {} : { message: e.message }),
        });
        return false;
      }
    })().finally(() => (this.preparing = null));
    return this.preparing;
  }
  setEmail(email) {
    this.preferredEmail = String(email || "").trim();
    try {
      this.storage?.setItem(EMAIL_KEY, this.preferredEmail);
    } catch {}
  }
  cacheRead() {
    try {
      const value = JSON.parse(this.storage?.getItem(TOKEN_KEY) || "null");
      return value?.clientId === this.clientId &&
        typeof value.accessToken === "string" &&
        Number.isFinite(value.expiresAt) &&
        value.expiresAt > this.now() + 15000
        ? value
        : null;
    } catch {
      return null;
    }
  }
  clearToken() {
    this.token = null;
    clearTimeout(this.expiryTimer);
    try {
      this.storage?.removeItem(TOKEN_KEY);
    } catch {}
  }
  expire() {
    this.epoch++;
    this.clearToken();
    this.set({
      status: "disconnected",
      account: null,
      message:
        "L’accès Google a expiré. Clique sur Se connecter pour le renouveler.",
    });
  }
  async profile(token) {
    const r = await this.fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: { Authorization: "Bearer " + token.accessToken },
        cache: "no-store",
        credentials: "omit",
        signal: AbortSignal.timeout(12000),
      },
    );
    if (!r.ok) {
      const e = Error("Impossible de vérifier le compte Google.");
      e.status = r.status;
      throw e;
    }
    const p = await r.json();
    if (!p.sub || !p.email)
      throw Error("Google n’a pas fourni l’identité du compte.");
    return { id: p.sub, email: p.email, name: p.name || p.email };
  }
  activate(token, account) {
    this.token = token;
    this.setEmail(account.email);
    try {
      this.storage?.setItem(TOKEN_KEY, JSON.stringify(token));
    } catch {}
    clearTimeout(this.expiryTimer);
    this.expiryTimer = setTimeout(
      () => this.expire(),
      Math.max(0, token.expiresAt - this.now() - 15000),
    );
    this.set({
      status: "connected",
      account,
      message:
        "Google connecté — accès valable jusqu’à " +
        new Date(token.expiresAt).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
    });
  }
  async check() {
    if (this.state.status === "authorizing") return;
    if (this.pending) return this.pending;
    const token = this.token || this.cacheRead();
    if (!token || token.expiresAt <= this.now() + 15000) {
      this.clearToken();
      this.set({
        status: "disconnected",
        account: null,
        message: "Connecte ton compte Google pour sauvegarder sur Drive.",
      });
      return;
    }
    const epoch = this.epoch;
    this.pending = (async () => {
      try {
        const account = await this.profile(token);
        if (epoch === this.epoch) this.activate(token, account);
      } catch (e) {
        if (epoch !== this.epoch) return;
        if (e.status === 401 || e.status === 403) this.expire();
        else
          this.set({
            status: "offline",
            account: null,
            message:
              "Google est momentanément inaccessible. Ta collection locale reste disponible.",
          });
      }
    })().finally(() => (this.pending = null));
    return this.pending;
  }
  // No await here: requestAccessToken must execute in the original button click.
  signIn(email = this.preferredEmail) {
    if (!this.oauth || !this.state.ready)
      throw Error(
        "Le module Google n’est pas prêt. Recharge-le avec le bouton prévu.",
      );
    if (this.state.status === "authorizing")
      throw Error("Une connexion Google est déjà en cours.");
    this.setEmail(email);
    const epoch = ++this.epoch;
    this.clearToken();
    this.set({
      status: "authorizing",
      account: null,
      message: "Termine la connexion dans la fenêtre Google.",
    });
    return new Promise((resolve, reject) => {
      let settled = false,
        receivedToken = false;
      const requestedEmail = this.preferredEmail;
      const fail = (message) => {
        if (settled || epoch !== this.epoch) return;
        settled = true;
        clearTimeout(this.authTimer);
        this.cancelPending = null;
        this.set({ status: "disconnected", account: null, message });
        reject(Error(message));
      };
      this.cancelPending = () => fail("Connexion annulée. Tu peux réessayer.");
      this.authTimer = setTimeout(
        () => fail("Google n’a pas terminé la connexion. Tu peux réessayer."),
        this.timeout,
      );
      const callback = async (response) => {
        if (settled || epoch !== this.epoch) return;
        if (response.error)
          return fail(
            response.error === "access_denied"
              ? "Autorisation Google refusée."
              : "La connexion Google a échoué. Réessaie.",
          );
        const seconds = Number(response.expires_in);
        if (!response.access_token || !Number.isFinite(seconds) || seconds <= 0)
          return fail("Réponse Google incomplète. Réessaie.");
        if (
          !String(response.scope || "")
            .split(" ")
            .includes(DRIVE_SCOPE)
        )
          return fail(
            "Autorise l’accès aux fichiers Drive de MyCinebox pour sauvegarder.",
          );
        receivedToken = true;
        const token = {
          clientId: this.clientId,
          accessToken: response.access_token,
          expiresAt: this.now() + Math.min(seconds, 86400) * 1000,
        };
        try {
          const account = await this.profile(token);
          if (settled || epoch !== this.epoch) return;
          if (
            requestedEmail &&
            account.email.toLowerCase() !== requestedEmail.toLowerCase()
          )
            return fail(
              "Google a choisi " +
                account.email +
                " au lieu de " +
                requestedEmail +
                ". Réessaie avec le compte souhaité.",
            );
          settled = true;
          clearTimeout(this.authTimer);
          this.cancelPending = null;
          this.activate(token, account);
          resolve(account);
        } catch (e) {
          fail(e.message);
        }
      };
      try {
        const client = this.oauth.initTokenClient({
          client_id: this.clientId,
          scope: SCOPES,
          include_granted_scopes: true,
          callback,
          error_callback: (error) => {
            if (!receivedToken)
              fail(
                error.type === "popup_closed"
                  ? "La fenêtre Google a été fermée avant la connexion. Réessaie."
                  : error.type === "popup_failed_to_open"
                    ? "La fenêtre Google a été bloquée. Autorise les fenêtres pour ce site puis réessaie."
                    : "Connexion Google interrompue. Réessaie.",
              );
          },
        });
        client.requestAccessToken({
          prompt: requestedEmail ? "" : "select_account",
          ...(requestedEmail ? { login_hint: requestedEmail } : {}),
        });
      } catch (e) {
        fail(e.message || "Connexion Google impossible.");
      }
    });
  }
  cancelSignIn() {
    this.cancelPending?.();
    this.epoch++;
  }
  async logout() {
    this.cancelSignIn();
    this.clearToken();
    this.set({
      status: "disconnected",
      account: null,
      message: "Déconnecté de Google sur ce navigateur.",
    });
  }
  async drive(path, options = {}) {
    const target = new URL(path, "https://www.googleapis.com");
    if (
      target.origin !== "https://www.googleapis.com" ||
      !/^\/(upload\/)?drive\/v3\/files(?:\/[A-Za-z0-9_-]+)?$/.test(
        target.pathname,
      )
    )
      throw Error("Adresse Drive non autorisée.");
    if (!this.token || this.token.expiresAt <= this.now() + 15000) {
      this.expire();
      throw Error(this.state.message);
    }
    if (this.state.status !== "connected")
      throw Error("Vérifie la connexion Google avant de sauvegarder.");
    const headers = new Headers(options.headers);
    headers.delete("X-CSRF-Token");
    headers.set("Authorization", "Bearer " + this.token.accessToken);
    const r = await this.fetch(target, {
      ...options,
      headers,
      credentials: "omit",
      cache: "no-store",
      signal: AbortSignal.timeout(25000),
    });
    if (r.status === 401) {
      this.expire();
      throw Error(this.state.message);
    }
    if (!r.ok)
      throw Error(
        r.status === 412
          ? "La sauvegarde a changé sur un autre appareil. Recharge-la avant de sauvegarder."
          : `Google Drive : erreur ${r.status}.`,
      );
    return r;
  }
  dispose() {
    this.window?.removeEventListener("storage", this.storageChanged);
    this.cancelSignIn();
    clearTimeout(this.expiryTimer);
    clearTimeout(this.authTimer);
    this.listeners.clear();
  }
}
