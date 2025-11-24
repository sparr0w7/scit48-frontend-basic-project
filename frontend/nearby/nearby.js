import { getNearbyUsers } from "../shared/messagesApi.js";
import {
  attachSocketLogger,
  subscribeToMessages,
} from "../shared/messagesSocket.js";

attachSocketLogger("nearby");

const listElement = document.getElementById("nearby-list");
const statusElement = document.getElementById("nearby-status");
const countElement = document.getElementById("nearby-count");
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
    const users = response?.users ?? [];
    updateSubnet(response?.network ?? null);
    updateCount(users.length);
    renderUsers(users);
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
    const row = document.createElement("div");
    row.className = "nearby-ip-row";
    row.textContent = user.ip ? user.ip : "알 수 없는 IP";
    fragment.appendChild(row);
  });

  listElement.replaceChildren(fragment);
}

function updateSubnet(networkLabel) {
  subnetPrefix = null;
  if (networkLabel) {
    const match = networkLabel.match(/^(\d+\.\d+\.\d+)\.0\/24$/);
    if (match) {
      subnetPrefix = `${match[1]}.`;
    }
  }
}

function updateCount(count) {
  if (!countElement) return;
  countElement.textContent = count > 0 ? `${count}명` : "없음";
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
