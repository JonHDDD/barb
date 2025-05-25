// Функції ініціалізації після завантаження фрагментів
function initNavigation() {
    const navLinks = document.querySelectorAll('nav a');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
                if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
                    // Обробка тільки для якірних посилань усередині сторінки
                    e.preventDefault();

                    const targetId = this.getAttribute('href');
                    const targetSection = document.querySelector(targetId);

                    if (targetSection) {
                        window.scrollTo({
                            top: targetSection.offsetTop - 80,
                            behavior: 'smooth'
                        });
                    }
                }
            }
        );
    });

    const bookingButtons = document.querySelectorAll('.btn');

    bookingButtons.forEach(button => {
        if (button.getAttribute('href') === '#booking') {
            button.addEventListener('click', function (e) {
                e.preventDefault();

                const bookingSection = document.querySelector('#booking');

                if (bookingSection) {
                    window.scrollTo({
                        top: bookingSection.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        }
    });
}

// Ініціалізація після завантаження DOM
document.addEventListener('DOMContentLoaded', function () {
});

// Ініціалізація після завантаження фрагментів
document.addEventListener('fragments-loaded', function () {
    // Ініціалізуємо навігацію
    initNavigation();

});