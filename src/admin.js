document.addEventListener('DOMContentLoaded', function() {
    // Ініціалізація вкладок
    initTabs();

    // Завантаження даних
    loadBookings();
    loadReviews();

    // Ініціалізація фільтрів
    initFilters();

    // Ініціалізація модальних вікон
    initDeleteModal();
});

// Ініціалізація вкладок
function initTabs() {
    const tabLinks = document.querySelectorAll('nav ul li a');
    const sections = document.querySelectorAll('.admin-section');

    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') === 'index.html') {
                return; // Не запобігаємо дії за замовчуванням
            }
            e.preventDefault();

            // Забираємо активний клас у всіх вкладок
            tabLinks.forEach(item => item.classList.remove('active'));

            // Додаємо активний клас поточної вкладки
            this.classList.add('active');

            // Отримуємо ID цільової секції
            const targetId = this.getAttribute('data-tab');

            // Приховуємо всі секції
            sections.forEach(section => section.classList.remove('active'));

            // Показуємо потрібну секцію
            document.getElementById(targetId).classList.add('active');
        });
    });
}

// Завантаження записів
function loadBookings() {
    const bookingsTable = document.getElementById('bookingsTable');
    const tbody = bookingsTable.querySelector('tbody');

    // Показуємо індикатор завантаження
    tbody.innerHTML = `
        <tr>
            <td colspan="8" class="loading-cell">
                <i class="fas fa-spinner fa-spin"></i> Завантаження...
            </td>
        </tr>
    `;

    // Запит до API
    fetch('http://localhost:8080/book')
        .then(response => {
            if (!response.ok) {
                throw new Error('Помилка при завантаженні записів');
            }
            return response.json();
        })
        .then(bookings => {
            if (bookings.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" class="loading-cell">
                            Немає записів
                        </td>
                    </tr>
                `;
                return;
            }

            // Очищуємо таблицю
            tbody.innerHTML = '';

            // Відображаємо записи
            bookings.forEach(booking => {
                const tr = document.createElement('tr');

                // Визначення класу послуги для стилізації
                let serviceClass = '';
                let serviceText = '';

                switch(booking.service) {
                    case 'haircut':
                        serviceClass = 'service-haircut';
                        serviceText = 'Чоловіча стрижка';
                        break;
                    case 'beard':
                        serviceClass = 'service-beard';
                        serviceText = 'Стрижка бороди';
                        break;
                    case 'shaving':
                        serviceClass = 'service-shaving';
                        serviceText = 'Королівське гоління';
                        break;
                    default:
                        serviceClass = '';
                        serviceText = booking.service || 'Невідома послуга';
                }

                tr.innerHTML = `
                    <td>${booking.id}</td>
                    <td>${booking.name}</td>
                    <td>${booking.phone}</td>
                    <td>${booking.email || '-'}</td>
                    <td><span class="service-label ${serviceClass}">${serviceText}</span></td>
                    <td>${booking.barber || 'Не вказано'}</td>
                    <td>${booking.date}</td>
                    <td>${booking.time}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon btn-delete" data-id="${booking.id}" data-type="booking">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                `;

                tbody.appendChild(tr);
            });

            // Ініціалізуємо кнопки видалення
            initDeleteButtons();
        })
        .catch(error => {
            console.error('Помилка:', error);
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="loading-cell">
                        Помилка при завантаженні записів. Спробуйте оновити сторінку.
                    </td>
                </tr>
            `;
        });
}

// Завантаження відгуків
function loadReviews() {
    const reviewsTable = document.getElementById('reviewsTable');
    const tbody = reviewsTable.querySelector('tbody');

    // Показуємо індикатор завантаження
    tbody.innerHTML = `
        <tr>
            <td colspan="5" class="loading-cell">
                <i class="fas fa-spinner fa-spin"></i> Завантаження...
            </td>
        </tr>
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
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="loading-cell">
                            Немає відгуків
                        </td>
                    </tr>
                `;
                return;
            }

            // Очищуємо таблицю
            tbody.innerHTML = '';

            // Відображаємо відгуки
            reviews.forEach(review => {
                const tr = document.createElement('tr');

                tr.innerHTML = `
                    <td>${review.id}</td>
                    <td>${review.name}</td>
                    <td>${review.phone}</td>
                    <td>${review.userReview}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon btn-delete" data-id="${review.id}" data-type="review">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                `;

                tbody.appendChild(tr);
            });

            // Ініціалізуємо кнопки видалення
            initDeleteButtons();
        })
        .catch(error => {
            console.error('Помилка:', error);
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="loading-cell">
                        Помилка при завантаженні відгуків. Спробуйте оновити сторінку.
                    </td>
                </tr>
            `;
        });
}

// Ініціалізація фільтрів
function initFilters() {
    const dateFilter = document.getElementById('dateFilter');
    const resetFilters = document.getElementById('resetFilters');

    if (dateFilter) {
        dateFilter.addEventListener('change', function() {
            filterBookingsByDate(this.value);
        });
    }

    if (resetFilters) {
        resetFilters.addEventListener('click', function() {
            // Скидаємо фільтри
            if (dateFilter) dateFilter.value = '';

            // Перезавантажуємо дані
            loadBookings();
        });
    }
}

// Фільтрування записів за датою
function filterBookingsByDate(date) {
    if (!date) {
        // Якщо дата не вибрана, просто завантажуємо всі записи
        loadBookings();
        return;
    }

    const bookingsTable = document.getElementById('bookingsTable');
    const tbody = bookingsTable.querySelector('tbody');

    // Показуємо індикатор завантаження
    tbody.innerHTML = `
        <tr>
            <td colspan="8" class="loading-cell">
                <i class="fas fa-spinner fa-spin"></i> Завантаження...
            </td>
        </tr>
    `;

    // Запит до API
    fetch('http://localhost:8080/book')
        .then(response => {
            if (!response.ok) {
                throw new Error('Помилка при завантаженні записів');
            }
            return response.json();
        })
        .then(bookings => {
            // Фільтруємо записи за датою
            const filteredBookings = bookings.filter(booking => booking.date === date);

            if (filteredBookings.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" class="loading-cell">
                            Немає записів на вибрану дату
                        </td>
                    </tr>
                `;
                return;
            }

            // Очищуємо таблицю
            tbody.innerHTML = '';

            // Відображаємо відфільтровані записи
            filteredBookings.forEach(booking => {
                const tr = document.createElement('tr');

                // Визначення класу послуги для стилізації
                let serviceClass = '';
                let serviceText = '';

                switch(booking.service) {
                    case 'haircut':
                        serviceClass = 'service-haircut';
                        serviceText = 'Чоловіча стрижка';
                        break;
                    case 'beard':
                        serviceClass = 'service-beard';
                        serviceText = 'Стрижка бороди';
                        break;
                    case 'shaving':
                        serviceClass = 'service-shaving';
                        serviceText = 'Королівське гоління';
                        break;
                    default:
                        serviceClass = '';
                        serviceText = booking.service || 'Невідома послуга';
                }

                tr.innerHTML = `
                    <td>${booking.id}</td>
                    <td>${booking.name}</td>
                    <td>${booking.phone}</td>
                    <td>${booking.email || '-'}</td>
                    <td><span class="service-label ${serviceClass}">${serviceText}</span></td>
                    <td>${booking.barber}</td>
                    <td>${booking.date}</td>
                    <td>${booking.time}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon btn-delete" data-id="${booking.id}" data-type="booking">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                `;

                tbody.appendChild(tr);
            });

            // Ініціалізуємо кнопки видалення
            initDeleteButtons();
        })
        .catch(error => {
            console.error('Помилка:', error);
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="loading-cell">
                        Помилка при завантаженні записів. Спробуйте оновити сторінку.
                    </td>
                </tr>
            `;
        });
}

// Ініціалізація кнопок видалення
function initDeleteButtons() {
    const deleteButtons = document.querySelectorAll('.btn-delete');

    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const type = this.getAttribute('data-type');

            showDeleteConfirmModal(id, type);
        });
    });
}

// Показати модальне вікно підтвердження видалення
function showDeleteConfirmModal(id, type) {
    const modal = document.getElementById('deleteConfirmModal');
    const confirmBtn = document.getElementById('confirmDeleteBtn');

    // Встановлюємо дані для підтвердження видалення
    confirmBtn.setAttribute('data-id', id);
    confirmBtn.setAttribute('data-type', type);

    // Відображаємо модальне вікно
    modal.classList.add('show');
}

// Ініціалізація модального вікна видалення
function initDeleteModal() {
    const confirmBtn = document.getElementById('confirmDeleteBtn');

    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const type = this.getAttribute('data-type');

            // Закрити модальне вікно
            closeModal('deleteConfirmModal');

            // Видаляємо запис або відгук
            if (type === 'booking') {
                deleteBooking(id);
            } else if (type === 'review') {
                deleteReview(id);
            }
        });
    }
}

// Видалення запису
function deleteBooking(id) {
    fetch(`http://localhost:8080/book/${id}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Помилка при видаленні запису');
            }

            showSuccessModal('Запис успішно видалено');
            loadBookings(); // Перезавантажуємо список запису
        })
        .catch(error => {
            console.error('Помилка:', error);
            showErrorModal('Помилка при видаленні запису: ' + error.message);
        });
}

// Видалення відгуку
function deleteReview(id) {
    fetch(`http://localhost:8080/review/${id}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Помилка при видаленні відгуку');
            }

            showSuccessModal('Відгук успішно видалено');
            loadReviews(); // Перезавантажуємо список відгуків
        })
        .catch(error => {
            console.error('Помилка:', error);
            showErrorModal('Помилка при видаленні відгуку: ' + error.message);
        });
}

// Показати модальне вікно успіху
function showSuccessModal(message) {
    const modal = document.getElementById('successModal');
    const messageEl = document.getElementById('successMessage');

    if (messageEl) {
        messageEl.textContent = message;
    }

    if (modal) {
        modal.classList.add('show');
    }
}

// Показати модальне вікно помилки
function showErrorModal(message) {
    const modal = document.getElementById('errorModal');
    const messageEl = document.getElementById('errorMessage');

    if (messageEl) {
        messageEl.textContent = message;
    }

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

// Закриття модального вікна під час кліку поза ним
window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    });
});