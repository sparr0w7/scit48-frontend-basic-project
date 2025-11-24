import { getSentMessages } from "../shared/messagesApi.js";
import { attachSocketLogger } from "../shared/messagesSocket.js";

attachSocketLogger("sent");

const listElement = document.querySelector("#sent-list .cards");
const refreshButton = document.getElementById("sent-refresh");
const totalElement = document.getElementById("sent-total");
const sentElement = document.getElementById("sent-sent");
const errorElement = document.getElementById("sent-error");

let cache = [];

function renderList(messages) {
  if (!listElement) {
    return;
  }

  if (!messages.length) {
    listElement.innerHTML = `
      <li class="sent-card">
        <div class="sent-empty">
          아직 보낸 쪽지가 없습니다. 첫 메시지를 전송해 보세요!
        </div>
      </li>
    `;
    updateSummary(messages);
    return;
  }

  listElement.innerHTML = "";
  messages.forEach((msg) => {
    const li = document.createElement("li");
    li.className = "sent-card";

    li.innerHTML = `
      <div class="sent-card__row">
        <span class="sent-card__label">받는 사람</span>
        <span class="sent-card__value">${msg.toIP}</span>
      </div>
      <div class="sent-card__row">
        <span class="sent-card__label">제목</span>
        <span class="sent-card__value">${escapeHtml(msg.subject || "(제목 없음)")}</span>
      </div>
      <div class="sent-card__row">
        <span class="sent-card__label">보낸 시각</span>
        <span class="sent-card__value">${formatTime(msg.createdAt)}</span>
      </div>
      <div class="sent-card__row">
        <span class="sent-card__label">상태</span>
        <span class="sent-card__value">
          ${renderStatusBadge(msg.status)}
        </span>
      </div>
    `;

    listElement.appendChild(li);
  });

  updateSummary(messages);
}

function updateSummary(messages) {
  const total = messages.length;
  const sent = messages.filter((m) => m.status === "sent").length;
  const error = total - sent;

  if (totalElement) totalElement.textContent = total.toString();
  if (sentElement) sentElement.textContent = sent.toString();
  if (errorElement) errorElement.textContent = error.toString();
}

function renderStatusBadge(status) {
  const safeStatus = (status || "").toLowerCase();
  const map = {
    sent: { label: "SENT", className: "sent-card__status--sent" },
    canceled: { label: "CANCELED", className: "sent-card__status--canceled" },
    failed: { label: "FAILED", className: "sent-card__status--failed" },
  };

  const meta = map[safeStatus] || {
    label: safeStatus || "UNKNOWN",
    className: "sent-card__status--failed",
  };

  return `<span class="sent-card__status ${meta.className}">${meta.label}</span>`;
}

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

async function loadSentMessages() {
  try {
    refreshButton?.setAttribute("disabled", "true");
    const response = await getSentMessages();
    cache = response.data || [];
    renderList(cache);
  } catch (error) {
    console.error("보낸 쪽지 불러오기 실패:", error);
    if (listElement) {
      listElement.innerHTML = `
        <li class="sent-card">
          <div class="sent-empty">
            데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </div>
        </li>
      `;
    }
  } finally {
    refreshButton?.removeAttribute("disabled");
  }
}

refreshButton?.addEventListener("click", () => loadSentMessages());
loadSentMessages();
