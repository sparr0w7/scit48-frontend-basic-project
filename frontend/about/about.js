const quickstartLinks = document.querySelectorAll('#quickstart + ul a');

quickstartLinks.forEach(link => {
    link.addEventListener('click', function (event) {
        event.preventDefault();

        window.location.href = `frontend/about/about.html/${this.textContent}`; // 주소 확인 후 수정필요
    });
});
