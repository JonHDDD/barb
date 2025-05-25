// Функція для завантаження HTML-фрагментів
function includeHTML() {
    const includes = document.querySelectorAll('[data-include]');

    includes.forEach(element => {
        const file = element.getAttribute('data-include');

        fetch(file)
            .then(response => {
                if (response.ok) {
                    return response.text();
                }
                throw new Error(`Неможливо завантажити ${file}`);
            })
            .then(html => {
                element.innerHTML = html;
                // Після завантаження всіх фрагментів запускаємо подію, щоб ініціалізувати скрипти
                if (element === includes[includes.length - 1]) {
                    document.dispatchEvent(new Event('fragments-loaded'));
                }
            })
            .catch(error => {
                console.error(error);
                element.innerHTML = `Ошибка загрузки фрагмента: ${file}`;
            });
    });
}

// Запускаємо функцію після завантаження DOM
document.addEventListener('DOMContentLoaded', includeHTML);