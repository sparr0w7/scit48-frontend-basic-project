import { APP_NAME, NAV_LINKS } from "./config.js";

function normalizeUrl(href) {
  const resolved = new URL(href, window.location.href);
  resolved.hash = "";
  resolved.search = "";
  if (resolved.pathname.endsWith("/index.html")) {
    resolved.pathname = resolved.pathname.replace(/\/index\.html$/, "/");
  }
  return resolved.href;
}

export function renderHeader(target) {
  if (!target) {
    return;
  }

  const header = document.createElement("header");
  header.className = "site-header";

  const wrapper = document.createElement("div");
  wrapper.className = "container site-header__inner";

  const brand = document.createElement("div");
  brand.className = "site-header__brand";
  const brandLink = document.createElement("a");
  brandLink.href = new URL("../index/index.html", window.location.href).href;
  brandLink.textContent = APP_NAME;
  brand.appendChild(brandLink);

  const nav = document.createElement("nav");
  nav.setAttribute("aria-label", APP_NAME);
  const list = document.createElement("ul");
  list.className = "site-header__nav-list";

  const currentUrl = normalizeUrl(window.location.href);

  NAV_LINKS.forEach((item) => {
    const listItem = document.createElement("li");
    const link = document.createElement("a");
    link.href = new URL(item.href, window.location.href).href;
    link.textContent = item.label;

    if (normalizeUrl(link.href) === currentUrl) {
      link.classList.add("is-current");
      link.setAttribute("aria-current", "page");
      const currentMark = document.createElement("span");
      currentMark.className = "current-indicator";
      currentMark.textContent = "[현재]";
      link.appendChild(currentMark);
    }

    listItem.appendChild(link);
    list.appendChild(listItem);
  });

  nav.appendChild(list);
  wrapper.appendChild(brand);
  wrapper.appendChild(nav);
  header.appendChild(wrapper);

  target.innerHTML = "";
  target.appendChild(header);
}
