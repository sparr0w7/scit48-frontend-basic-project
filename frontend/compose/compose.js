import { sendMessage } from "../shared/messagesApi.js";
import { attachSocketLogger } from "../shared/messagesSocket.js";

attachSocketLogger("compose");

// TouchEvent.changedtouches
const ipInput = document.getElementById("ip");
const titleInput = document.getElementById("title");
const messageInput = document.getElementById("message");
const previewTitle = document.getElementById("preview-title");
const previewMessage = document.getElementById("preview-message");
const composeForm = document.getElementById("compose-form");
const resetbutton = document.querySelector("input[type=reset]");
resetbutton.addEventListener("click", () => {
  reset();
});

titleInput.addEventListener("input", () => {
  previewTitle.textContent = "제목 : " + (titleInput.value || "(없음)");
});

messageInput.addEventListener("input", () => {
  previewMessage.textContent = "내용 : " + (messageInput.value || "(내용없음)");
});

composeForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const ipValue = ipInput.value.trim();
  const titleValue = titleInput.value.trim();
  const messageValue = messageInput.value.trim();

  if (!ipValue) {
    alert("수신자 IP를 입력해주세요.");
    ipInput.focus();
    return;
  }

  const ipPattern =
    /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
  if (!ipPattern.test(ipValue)) {
    alert("올바른 IP 주소 형식이 아닙니다.");
    ipInput.focus();
    return;
  }

  if (!messageValue) {
    alert("메세지를 입력해주세요.");
    messageInput.focus();
    return;
  }

  try {
    sendMessage({
      toIP: ipValue,
      subject: titleValue,
      body: messageValue,
    });
    reset();
    alert("성공적으로 쪽지를 보냈습니다.");
  } catch (err) {
    console.log("전송 중 에러가 발생했습니다.");
  }
});

// 주소 가져오기
let apiUrl = "https://api.ipify.org?format=json";
fetch(apiUrl)
  .then((response) =>
    response.ok ? response.json() : Promise.reject("API 응답 실패")
  )
  .then((data) => {
    myinfo.children[0].innerHTML = "내 ip : " + data.ip;
  });

//닉네임 가져오기
const iframe = document.createElement("iframe");
iframe.src = "../index/index.html";
iframe.style.display = "none";
iframe.onload = () => {
  const nickname =
    iframe.contentWindow.document.querySelector(".yourName .nb").textContent;
  myinfo.children[2].innerHTML = "닉네임 : " + nickname;
};
document.body.appendChild(iframe);

function reset() {
  previewTitle.textContent = "제목 : (없음)";
  previewMessage.textContent = "내용 : (내용없음)";
}
