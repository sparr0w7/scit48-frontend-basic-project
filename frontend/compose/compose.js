
// TouchEvent.changedtouches
const titleInput = document.getElementById("title");
const messageInput = document.getElementById("message");
const previewTitle = document.getElementById("preview-title");
const previewMessage = document.getElementById("preview-message");
const resetbutton = document.querySelector("input[type=reset]");
resetbutton.addEventListener("click", () => {
    previewTitle.textContent = "제목 : (없음)";
    previewMessage.textContent = "내용 : (내용없음)";
})

titleInput.addEventListener("input", () => {
    previewTitle.textContent = "제목 : " + (titleInput.value || "(없음)");
});

messageInput.addEventListener("input", () => {
    previewMessage.textContent = "내용 : " + (messageInput.value || "(내용없음)");
});



// 주소 가져오기
let apiUrl = 'https://api.ipify.org?format=json';
fetch(apiUrl)
    .then(response => response.ok ? response.json() : Promise.reject('API 응답 실패'))
    .then(data => {
        myinfo.children[0].innerHTML = "내 ip : " + data.ip;
    });


//닉네임 가져오기
const iframe = document.createElement('iframe');
iframe.src = "../index/index.html";
iframe.style.display = 'none';
iframe.onload = () => {
    const nickname = iframe.contentWindow.document.querySelector('.yourName .nb').textContent;
    myinfo.children[2].innerHTML = "닉네임 : " + nickname;
};
document.body.appendChild(iframe);


