// TODO: 이 페이지 로직은 추후 구현
import {
  sendMessage,
  getInboxMessages,
  getSentMessages,
  getMessage,
  cancelMessage,
  deleteMessage,
  getMessagesByStatus,
} from "../shared/messagesApi.js";
import { subscribeToMessages } from "../shared/messagesSocket.js";
let messages = [];
const inboxList = document.getElementById("inbox-list");
const cardsContainer = inboxList?.querySelector(".cards");
const totalElement = document.getElementById("inbox-total");
const refreshButton = document.getElementById("inbox-refresh");

const listRender = (messages) => {
  if (!cardsContainer) {
    return;
  }

  if (!messages || messages.length === 0) {
    emptyRender();
    return;
  }

  cardsContainer.innerHTML = "";
  messages.forEach((item) => {
    cardsContainer.innerHTML += `
      <li class="inbox-card">
        <a href="#" class="message-item">
          <div class="message-item__row">
            <span class="msg-label">발신자</span>
            <span class="msg-value">${item.toIP}</span>
          </div>
          <div class="message-item__row">
            <span class="msg-label">내용</span>
            <span class="msg-value">${item.subject || "(제목 없음)"}</span>
          </div>
          <div class="message-item__row">
            <span class="msg-label">날짜</span>
            <span class="msg-value">${formatTimestamp(item.createdAt)}</span>
          </div>
        </a>
      </li>
    `;
  });

  updateTotal(messages.length);
};

const emptyRender = () => {
  if (!cardsContainer) {
    return;
  }

  cardsContainer.innerHTML = `
    <li class="inbox-card inbox-card--empty">
      <div class="inbox-empty">
        <p>받은 쪽지가 없습니다.</p>
        <span>새로운 메시지가 도착하면 자동으로 표시됩니다.</span>
      </div>
    </li>
  `;
  updateTotal(0);
};

const updateTotal = (count) => {
  if (totalElement) {
    totalElement.textContent = count.toString();
  }
};

const formatTimestamp = (value) => {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const init = async () => {
  subscribeToMessages({
    onReceived: (msg) => {
      console.log("📩 새 메시지 수신:", msg);
      messages = [msg, ...messages];
      listRender(messages);
    },

    onUpdated: (msg) => {
      console.log("📝 메시지 수정됨:", msg);
    },

    onDeleted: (id) => {
      console.log("❌ 메시지 삭제됨:", id);
    },
  });

  try {
    const response = await getInboxMessages();
    messages = response.data;
    listRender(messages);
  } catch (err) {
    emptyRender();
  }
};
init();

refreshButton?.addEventListener("click", () => window.location.reload());
