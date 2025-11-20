
import { attachSocketLogger } from "../shared/messagesSocket.js";

attachSocketLogger("about");

document.querySelectorAll('.FAQ [role="button"]').forEach(button => {
    button.addEventListener('click', (e) => {
        const existing = document.querySelector('.faq-popup');
        if (existing) existing.remove();

        const popup = document.createElement('div');
        popup.className = 'faq-popup';
        const iframe = document.createElement('iframe');
        iframe.src = 'about.html'; // 여기에 원하는 URL 입력

        popup.appendChild(iframe);



        const rect = button.getBoundingClientRect();
        popup.style.position = 'absolute';
        popup.style.top = `${rect.bottom + window.scrollY + 5}px`;
        popup.style.left = `${rect.left + window.scrollX}px`;

        document.body.appendChild(popup);




        button.addEventListener('mouseleave', () => {
            document.addEventListener('click', () => {
                popup.remove();
            });
        });

        popup.addEventListener('mouseleave', () => {
            document.addEventListener('click', () => {
                popup.remove();
            });
        });

    });
});
