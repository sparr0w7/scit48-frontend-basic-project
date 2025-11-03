import { APP_NAME } from "./config.js";

export function renderFooter(target) {
  if (!target) {
    return;
  }

  const footer = document.createElement("footer");
  footer.className = "site-footer";

  const wrapper = document.createElement("div");
  wrapper.className = "container";

  const message = document.createElement("p");
  const year = new Date().getFullYear();
  message.textContent = `© ${year} ${APP_NAME} · 동일 IP 공유 주의`;

  wrapper.appendChild(message);
  footer.appendChild(wrapper);

  target.innerHTML = "";
  target.appendChild(footer);
}
