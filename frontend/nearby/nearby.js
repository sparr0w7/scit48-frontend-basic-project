import { getNearbyUsers } from "../shared/messagesApi.js";
import {
  attachSocketLogger,
  subscribeToMessages,
} from "../shared/messagesSocket.js";

attachSocketLogger("nearby");

const listElement = document.getElementById("nearby-list");
const statusElement = document.getElementById("nearby-status");
const networkElement = document.getElementById("nearby-network");
const refreshButton = document.getElementById("nearby-refresh");

let isLoading = false;
let subnetPrefix = null;

async function loadNearbyUsers(showSpinner = true) {
  if (isLoading) {
    return;
  }
  isLoading = true;
  setRefreshState(true);

  if (showSpinner) {
    showStatus("info", "주변 사용자 정보를 불러오는 중입니다...");
    listElement.innerHTML = "";
  }

  try {
    const response = await getNearbyUsers();
    updateNetwork(response?.network ?? null);
    renderUsers(response?.users ?? []);
  } catch (error) {
    console.error("주변 사용자 조회 실패:", error);
    showStatus(
      "error",
      "주변 사용자 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."
    );
  } finally {
    isLoading = false;
    setRefreshState(false);
  }
}

function renderUsers(users) {
  if (!users.length) {
    showStatus("empty", "아직 같은 대역에서 감지된 사용자가 없어요.");
    listElement.innerHTML = "";
    return;
  }

  hideStatus();
  const fragment = document.createDocumentFragment();

  users.forEach((user) => {
    const card = document.createElement("article");
    card.className = "nearby-card";

    const subject = user.recentSubject || "최근 메시지 없음";
    const preview = user.recentPreview || "내용을 확인해 보세요.";
    const ipLabel = escapeHtml(user.ip);

    card.innerHTML = `
      <div class="nearby-card__ip">${ipLabel}</div>
      <div class="nearby-card__meta">
        <span class="nearby-card__badge">보냄 ${user.sentCount}</span>
        <span class="nearby-card__badge nearby-card__badge--secondary">
          받음 ${user.receivedCount}
        </span>
      </div>
      <div class="nearby-card__time">${formatTime(user.lastActive)}</div>
      <div class="nearby-card__subject">${escapeHtml(subject)}</div>
      <p class="nearby-card__preview">${escapeHtml(preview)}</p>
    `;

    fragment.appendChild(card);
  });

  listElement.replaceChildren(fragment);
}

function updateNetwork(networkLabel) {
  networkElement.textContent = networkLabel || "확인 중...";

  subnetPrefix = null;
  if (networkLabel) {
    const match = networkLabel.match(/^(\d+\.\d+\.\d+)\.0\/24$/);
    if (match) {
      subnetPrefix = `${match[1]}.`;
    }
  }
}

function showStatus(state, message) {
  statusElement.dataset.state = state;
  statusElement.textContent = message;
  statusElement.classList.remove("is-hidden");
}

function hideStatus() {
  statusElement.classList.add("is-hidden");
  statusElement.textContent = "";
}

function setRefreshState(disabled) {
  if (!refreshButton) return;
  if (disabled) {
    refreshButton.setAttribute("disabled", "true");
  } else {
    refreshButton.removeAttribute("disabled");
  }
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

function isSameSubnet(ip) {
  return Boolean(subnetPrefix && ip && ip.startsWith(subnetPrefix));
}

refreshButton?.addEventListener("click", () => loadNearbyUsers());

subscribeToMessages({
  onReceived: (message) => {
    if (isSameSubnet(message?.fromIP) || isSameSubnet(message?.toIP)) {
      loadNearbyUsers(false);
    }
  },
  onUpdated: (message) => {
    if (isSameSubnet(message?.fromIP) || isSameSubnet(message?.toIP)) {
      loadNearbyUsers(false);
    }
  },
});

loadNearbyUsers(true);
