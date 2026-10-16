import { createApp } from "./app.js";
createApp().catch((error) => {
  const root = document.getElementById("app");
  const title = document.createElement("h1"),
    message = document.createElement("p"),
    retry = document.createElement("button");
  title.textContent = "Ouverture impossible";
  message.textContent = error.message;
  retry.textContent = "Réessayer";
  retry.addEventListener("click", () => location.reload());
  root.className = "startup";
  root.replaceChildren(title, message, retry);
});
if ("serviceWorker" in navigator)
  navigator.serviceWorker.register("./sw.js").catch(() => {});
