// Ініціалізація після завантаження фрагментів
document.addEventListener('fragments-loaded', function() {
    const reviewForm = document.getElementById('reviewForm');
    const reviewsList = document.getElementById('reviewsList');

    // Завантаження існуючих відгуків
    fetchReviews();

    // Обробка відправки форми відкликання
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Отримуємо дані форми
            const formData = new FormData(this);
            const reviewData = {};

            for (let [key, value] of formData.entries()) {
                reviewData[key] = value;
            }

            // Валідація перед відправкою
            if (!validateReviewForm(reviewData)) {
                return;
            }

            // Відображаємо індикатор завантаження
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Надсилання...';

            // Відправляємо дані на бекенд
            fetch('http://localhost:8080/review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reviewData)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Помилка при відправці даних');
                    }
                    return response.json();
                })
                .then(data => {
                    // Успішна відповідь від сервера
                    showModal('successModal');
                    reviewForm.reset();

                    // Оновлюємо список відгуків
                    fetchReviews();
                })
                .catch(error => {
                    // Обробка помилок
                    console.error('Помилка:', error);
                    showModal('errorModal');
                })
                .finally(() => {
                    // Повертаємо кнопці вихідний стан
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                });
        });
    }
});

// Функція валідації форми відкликання
function validateReviewForm(data) {
    // Перевірка імені
    if (!data.name || data.name.trim() === '') {
        alert('Будь ласка, введіть ваше ім\'я');
        return false;
    }

    // Перевірка телефону
    if (!data.phone || !isValidPhone(data.phone)) {
        alert('Будь ласка, введіть коректний номер телефону');
        return false;
    }

    // Перевірка тексту відгуку
    if (!data.userReview || data.userReview.trim() === '') {
        alert('Будь ласка, напишіть ваш відгук');
        return false;
    }

    return true;
}

// Перевірка формату телефону
function isValidPhone(phone) {
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    return phoneRegex.test(phone);
}

// Функція завантаження відгуків
function fetchReviews() {
    const reviewsList = document.getElementById('reviewsList');

    if (reviewsList) {
        // Показуємо індикатор завантаження
        reviewsList.innerHTML = `
            <div class="reviews-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Завантаження відгуків...</p>
            </div>
        `;

        // Запит до API
        fetch('http://localhost:8080/review')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Помилка при завантаженні відгуків');
                }
                return response.json();
            })
            .then(reviews => {
                if (reviews.length === 0) {
                    // Якщо відгуків немає
                    reviewsList.innerHTML = `
                        <div class="reviews-empty">
                            <p>Поки що немає відгуків. Будьте першим, хто залишить відгук!</p>
                        </div>
                    `;
                } else {

                    // Відображаємо відгуки
                    reviewsList.innerHTML = '';
                    reviews.forEach(review => {
                        const initials = getInitials(review.name);
                        const card = createReviewCard(review, initials);
                        reviewsList.appendChild(card);
                    });
                }
            })
            .catch(error => {
                console.error('Помилка:', error);
                reviewsList.innerHTML = `
                    <div class="reviews-empty">
                        <p>Помилка при завантаженні відгуків. Спробуйте оновити сторінку.</p>
                    </div>
                `;
            });
    }
}

// Функція створення картки відгуку
function createReviewCard(review, initials) {
    const card = document.createElement('div');
    card.className = 'review-card';

    card.innerHTML = `
        <div class="review-header">
            <div class="review-avatar">${initials}</div>
            <div>
                <div class="review-author">${review.name}</div>
                <div class="review-date">${review.date}</div>
            </div>
        </div>
        <div class="review-content">
            ${review.userReview}
        </div>
    `;

    return card;
}

// Отримання ініціалів з імені
function getInitials(name) {
    return name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// Показати модальне вікно
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
    }
}

// Закрити модальне вікно
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

// Закриття модального вікна при кліку поза ним
window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    });
});