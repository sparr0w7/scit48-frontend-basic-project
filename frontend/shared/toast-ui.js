import { onToast } from "./toast.js";

function initToastUI() {
  let container = document.querySelector(".toast-container");

  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  onToast((event) => {
    const toast = document.createElement("div");
    toast.className = "toast";

    if (event?.type === "message-received") {
      const { subject, body, fromIP } = event.payload || {};
      const title = subject || "새 쪽지 도착!";
      const preview = body ? body.slice(0, 60) : "";

      const titleEl = document.createElement("div");
      titleEl.className = "toast-title";
      titleEl.textContent = title;

      const metaEl = document.createElement("div");
      metaEl.className = "toast-meta";
      metaEl.textContent = fromIP || "알 수 없는 발신자";

      const bodyEl = document.createElement("div");
      bodyEl.className = "toast-body";
      bodyEl.textContent = preview || "내용을 확인해 보세요.";

      toast.appendChild(titleEl);
      toast.appendChild(metaEl);
      toast.appendChild(bodyEl);
    } else {
      toast.textContent = event?.message || "알림이 도착했습니다.";
    }

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("is-visible");
    });

    setTimeout(() => {
      toast.classList.remove("is-visible");
      toast.addEventListener(
        "transitionend",
        () => toast.remove(),
        { once: true }
      );
    }, 4000);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initToastUI, { once: true });
} else {
  initToastUI();
}
