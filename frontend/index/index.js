import { attachSocketLogger } from "../shared/messagesSocket.js";

attachSocketLogger("index");

// 파일: ./index.js   AI의 도움을 많이 받았습니다

// 1. 전역 변수 (API URL) 정의
const apiUrl = 'https://api.ipify.org?format=json';

/**
 * IP를 가져와 화면에 표시합니다.
 */
function fetchAndDisplayUserIP() {
    const ipDisplayElement = document.getElementById('userIpDisplay');

    if (!ipDisplayElement) return;

    // IP 요청 시작 시 메시지 표시
    ipDisplayElement.textContent = '불러오는 중...';
    ipDisplayElement.style.visibility = 'visible';

    fetch(apiUrl)
        .then(response => response.ok ? response.json() : Promise.reject('API 응답 실패'))
        .then(data => {
            ipDisplayElement.textContent = data.ip;
        })
        .catch(error => {
            console.error('IP 주소 가져오기 오류:', error);
            ipDisplayElement.textContent = 'IP 확인 불가';
        });
}


document.addEventListener('DOMContentLoaded', () => {
    // 페이지 로드 직후 IP 확인
    fetchAndDisplayUserIP();

    const checkButton = document.getElementById('checkIpButton');

    // 🌟 버튼 클릭 시 IP 정보 가져오기 함수 연결
    if (checkButton) {
        checkButton.addEventListener('click', (event) => {
            event.preventDefault();
            fetchAndDisplayUserIP(); // 필요 시 IP 다시 확인
        });
    }
});
