// TODO: 이 페이지 로직은 추후 구현
import {
  sendMessage,
  getInboxMessages,
  getSentMessages,
  getMessage,
  cancelMessage,
  deleteMessage,
  getMessagesByStatus,
  getMyPublicIp,
  connectMessagesSocket,
} from "../shared/messagesApi.js";
let messages = [];
const listRender = (messages) => {
  const inboxList = document.getElementById("inbox-list");
  console.log(messages);
  if (!messages) {
    emptyRender();
    return;
  }
  inboxList.innerHTML = "";
  messages.forEach((item) => {
    inboxList.innerHTML += `
    <li>
      <a href="#" class="message-item">
        <span class="msg-index"><b>발신자</b> : ${item.toIP}</span><br>
        <span class="msg-title"><b>내용</b> : ${item.subject}</span><br>
        <span class="msg-title"><b>날짜</b> : ${item.createdAt}</span>
      </a>
    </li>
    <hr>
    `;
  });
};

const emptyRender = () => {
  const inboxList = document.getElementById("inbox-list");
  inboxList.innerHTML += `
            <h2>받은 쪽지가 없습니다.</h2>
        `;
};

const init = async () => {
  const ip = await getMyPublicIp();
  connectMessagesSocket({
    onReceived: (msg) => {
      console.log("📩 새 메시지 수신:", msg);
      messages = [msg, ...messages];
      // 예: 받은 쪽지 목록에 추가
      listRender(messages);
    },

    onUpdated: (msg) => {
      console.log("📝 메시지 수정됨:", msg);
      // 예: 상태(status) 갱신
    },

    onDeleted: (id) => {
      console.log("❌ 메시지 삭제됨:", id);
      // 예: 해당 id 항목을 DOM에서 제거
    },
  });
  console.log("init");
  try {
    const response = await getInboxMessages();
    messages = response.data;
    listRender(messages);
  } catch (err) {
    emptyRender();
  }
};
init();
