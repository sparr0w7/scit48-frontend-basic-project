import { APP_NAME } from "./config.js";

export function renderFooter(target) {
  if (!target) {
    return;
  }

  const footer = document.createElement("footer");
  footer.className = "site-footer";
  // 색상 통일: 헤더와 어울리는 어두운 톤으로 강제 지정
  footer.style.backgroundColor = "#0f1217";
  footer.style.borderTop = "1px solid #24323d";
  footer.style.color = "#d5d9e6";

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
