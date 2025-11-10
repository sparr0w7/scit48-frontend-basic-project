// 파일: ./index.js   AI의 도움을 많이 받았습니다

// 1. 전역 변수 (API URL) 정의
const apiUrl = 'https://api.ipify.org?format=json';

/**
 * IP 주소에서 /24 대역을 계산합니다.
 */
function calculate24Range(userIp) {
    const ipParts = userIp.split('.');
    if (ipParts.length === 4) {
        // 마지막 옥텟을 0으로 변경
        ipParts[3] = '0';
        return ipParts.join('.');
    }
    return '계산 오류';
}

/**
 * IP를 가져와 전체 IP와 대역 모두 표시합니다. (버튼 클릭 시 사용)
 */
function fetchAndDisplayUserIP() {
    const ipDisplayElement = document.getElementById('userIpDisplay');
    const ip24DisplayElement = document.getElementById('user24Display');

    if (!ipDisplayElement || !ip24DisplayElement) return;

    // IP 요청 시작 시, '불러오는 중...' 메시지를 표시하며 요소를 보이게 함
    ipDisplayElement.textContent = '불러오는 중...';
    ip24DisplayElement.textContent = '불러오는 중...';
    ipDisplayElement.style.visibility = 'visible';
    ip24DisplayElement.style.visibility = 'visible';

    fetch(apiUrl)
        .then(response => response.ok ? response.json() : Promise.reject('API 응답 실패'))
        .then(data => {
            const userIp = data.ip;
            const ip24Range = calculate24Range(userIp);

            // 🌟 IP와 대역을 동시에 표시
            ipDisplayElement.textContent = userIp;
            ip24DisplayElement.textContent = ip24Range;
        })
        .catch(error => {
            console.error('IP 주소 가져오기 오류:', error);
            ipDisplayElement.textContent = 'IP 확인 불가';
            ip24DisplayElement.textContent = '대역 확인 불가';
        });
}


document.addEventListener('DOMContentLoaded', () => {
    const checkButton = document.getElementById('checkIpButton');

    // 🌟 버튼 클릭 시 IP 정보 가져오기 함수 연결
    if (checkButton) {
        checkButton.addEventListener('click', (event) => {
            event.preventDefault();
            fetchAndDisplayUserIP(); // IP와 대역 모두 표시
        });
    }
});