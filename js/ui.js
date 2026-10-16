export function dom(document) {
  function h(tag, props = {}, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
      if (value === undefined || value === null) continue;
      if (key.startsWith("on"))
        node.addEventListener(key.slice(2).toLowerCase(), value);
      else if (key === "class") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key === "dataset") Object.assign(node.dataset, value);
      else if (key === "style") Object.assign(node.style, value);
      else if (key in node && key !== "list") node[key] = value;
      else node.setAttribute(key, String(value));
    }
    for (const child of children.flat(Infinity)) {
      if (child !== null && child !== undefined && child !== false)
        node.append(
          typeof child === "object"
            ? child
            : document.createTextNode(String(child)),
        );
    }
    return node;
  }
  const button = (text, action, props = {}) =>
    h("button", { type: "button", onClick: action, ...props }, text);
  const field = (text, input) => h("label", {}, text, input);
  function select(options, value, onChange) {
    const node = h(
      "select",
      { onChange },
      Object.entries(options).map(([v, label]) =>
        h("option", { value: v }, label),
      ),
    );
    node.value = value;
    return node;
  }
  return { h, button, field, select };
}
export const safeImage = (value) =>
  typeof value === "string" &&
  /^(https?:\/\/|data:image\/(png|jpeg|webp|gif);base64,)/i.test(value)
    ? value
    : "";
export function download(document, data, name) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
