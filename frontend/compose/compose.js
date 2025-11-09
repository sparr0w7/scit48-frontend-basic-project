
// TouchEvent.changedtouches
const titleInput = document.getElementById("title");
const messageInput = document.getElementById("message");
const previewTitle = document.getElementById("preview-title");
const previewMessage = document.getElementById("preview-message");

titleInput.addEventListener("input", () => {
    previewTitle.textContent = "제목 : " + (titleInput.value || "(없음)");
});

messageInput.addEventListener("input", () => {
    previewMessage.textContent = "내용 : " + (messageInput.value || "(내용없음)");
});


const my_ip = "999.999.999.999";
const my_nickname = "가즈아";


const myinfo = document.getElementById("myinfo");
myinfo.children[0].innerHTML = "내 ip : " + my_ip;
myinfo.children[2].innerHTML = "닉네임 : " + my_nickname;
