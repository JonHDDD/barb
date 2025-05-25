// Ініціалізація форми бронювання після завантаження фрагментів
document.addEventListener('fragments-loaded', function() {
    const bookingForm = document.querySelector('.booking-form form');
    const barberSelect = document.getElementById('barber-select');
    const dateInput = document.getElementById('date-input');
    const timeSelect = document.querySelector('select[name="time"]');

    // Встановлюємо мінімальну дату (сьогодні)
    if (dateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const minDate = `${yyyy}-${mm}-${dd}`;
        dateInput.setAttribute('min', minDate);
    }

    // Слухачі змін для барбера та дати
    if (barberSelect && dateInput) {
        barberSelect.addEventListener('change', updateAvailableTime);
        dateInput.addEventListener('change', updateAvailableTime);
    }

    // Функція отримання доступного часу
    function getAvailableTimeSlots(isToday, currentHour) {
        const allTimeSlots = [
            '10:00', '11:00', '12:00', '13:00',
            '14:00', '15:00', '16:00', '17:00', '18:00'
        ];

        if (!isToday) {
            return allTimeSlots;
        }

        // Якщо вибрано сьогоднішню дату, фільтруємо минулий час
        return allTimeSlots.filter(time => {
            const [hours] = time.split(':').map(Number);
            // Додаємо 1 годину буфера (якщо зараз 13:30, то можна записатися з 15:00)
            return hours > currentHour + 1;
        });
    }

    // Завантаження доступного часу в залежності від барбера та дати
    function updateAvailableTime() {
        const selectedBarber = barberSelect.value;
        const selectedDate = dateInput.value;

        // Перевіряємо, що обрано і барбер, і дату
        if (!selectedBarber || !selectedDate) {
            return;
        }

        // Перевіряємо, чи обрано сьогоднішню дату
        const today = new Date();
        const selectedDateObj = new Date(selectedDate);
        const isToday = selectedDateObj.toDateString() === today.toDateString();

        // Блокуємо вибір часу на час завантаження
        timeSelect.disabled = true;

        // Отримуємо всі записи для перевірки доступності часу
        fetch('http://localhost:8080/book')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Помилка при завантаженні записів');
                }
                return response.json();
            })
            .then(bookings => {
                // Отримуємо список доступних слотів з урахуванням поточного часу
                const availableTimeSlots = getAvailableTimeSlots(isToday, today.getHours());

                // Знаходимо зайняті слоти для обраного барбера та дати
                const bookedTimeSlots = bookings
                    .filter(booking => booking.barber === selectedBarber && booking.date === selectedDate)
                    .map(booking => booking.time);

                // Очищаємо поточний список часу
                timeSelect.innerHTML = '<option value="">Оберіть час</option>';

                // Додаємо тільки доступний час
                availableTimeSlots.forEach(time => {
                    if (!bookedTimeSlots.includes(time)) {
                        const option = document.createElement('option');
                        option.value = time;
                        option.textContent = time;
                        timeSelect.appendChild(option);
                    }
                });

                // Розблокуємо вибір часу
                timeSelect.disabled = false;

                // Якщо немає доступних слотів
                if (timeSelect.options.length === 1) {
                    const option = document.createElement('option');
                    option.value = "";
                    option.textContent = "Немає доступного часу на цю дату";
                    option.disabled = true;
                    timeSelect.appendChild(option);
                }

                // Оновлюємо інформацію про доступність
                updateAvailabilityInfo();
            })
            .catch(error => {
                console.error('Помилка:', error);
                // У разі помилки показуємо доступні тимчасові слоти
                const availableTimeSlots = getAvailableTimeSlots(isToday, today.getHours());

                timeSelect.innerHTML = '<option value="">Оберіть час</option>';
                availableTimeSlots.forEach(time => {
                    const option = document.createElement('option');
                    option.value = time;
                    option.textContent = time;
                    timeSelect.appendChild(option);
                });
                timeSelect.disabled = false;
            });
    }

    // Функція перевірки доступності барбера
    function checkBarberAvailability(barber, date) {
        return fetch('http://localhost:8080/book')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Помилка при завантаженні записів');
                }
                return response.json();
            })
            .then(bookings => {
                // Фільтруємо записи по барберу та даті
                const barberBookingsOnDate = bookings.filter(
                    booking => booking.barber === barber && booking.date === date
                );

                // Перевіряємо, чи це сьогоднішня дата
                const today = new Date();
                const selectedDateObj = new Date(date);
                const isToday = selectedDateObj.toDateString() === today.toDateString();

                // Отримуємо доступні слоти з урахуванням поточного часу
                const availableTimeSlots = getAvailableTimeSlots(isToday, today.getHours());
                const totalSlots = availableTimeSlots.length;

                // Вважаємо дійсно зайняті слоти
                const bookedSlots = barberBookingsOnDate.filter(booking =>
                    availableTimeSlots.includes(booking.time)
                ).length;

                // Розраховуємо доступність у відсотках
                const availableSlots = totalSlots - bookedSlots;
                const availabilityPercentage = totalSlots > 0 ?
                    (availableSlots / totalSlots) * 100 : 0;

                return {
                    barber,
                    date,
                    availableSlots,
                    totalSlots,
                    availabilityPercentage
                };
            });
    }

    // Оновлення інформації про доступність
    function updateAvailabilityInfo() {
        const selectedBarber = barberSelect.value;
        const selectedDate = dateInput.value;

        if (!selectedBarber || !selectedDate) {
            return;
        }

        // Створюємо чи знаходимо div для інформації про доступність
        let availabilityInfo = document.getElementById('availability-info');
        if (!availabilityInfo) {
            availabilityInfo = document.createElement('div');
            availabilityInfo.id = 'availability-info';
            availabilityInfo.className = 'availability-info';
            timeSelect.parentNode.insertAdjacentElement('afterend', availabilityInfo);
        }

        checkBarberAvailability(selectedBarber, selectedDate)
            .then(info => {
                if (info.totalSlots === 0) {
                    availabilityInfo.innerHTML = `
                        <p class="availability-error">
                            <i class="fas fa-times-circle"></i>
                            На жаль, на цю дату вже немає доступного часу для запису.
                        </p>
                    `;
                } else if (info.availableSlots === 0) {
                    availabilityInfo.innerHTML = `
                        <p class="availability-error">
                            <i class="fas fa-exclamation-triangle"></i>
                            На жаль, у барбера ${info.barber} немає вільних слотів на ${formatDate(info.date)}.
                            Будь ласка, оберіть іншу дату або іншого барбера.
                        </p>
                    `;
                } else if (info.availabilityPercentage <= 30) {
                    availabilityInfo.innerHTML = `
                        <p class="availability-warning">
                            <i class="fas fa-exclamation-circle"></i>
                            У барбера ${info.barber} залишилось лише ${info.availableSlots} вільних слотів на ${formatDate(info.date)}.
                            Поспішайте забронювати!
                        </p>
                    `;
                } else {
                    availabilityInfo.innerHTML = `
                        <p class="availability-good">
                            <i class="fas fa-check-circle"></i>
                            У барбера ${info.barber} доступно ${info.availableSlots} вільних слотів на ${formatDate(info.date)}.
                        </p>
                    `;
                }
            })
            .catch(error => {
                console.error('Помилка:', error);
                availabilityInfo.innerHTML = `
                    <p class="availability-error">
                        <i class="fas fa-exclamation-triangle"></i>
                        Помилка при перевірці доступності. Спробуйте ще раз.
                    </p>
                `;
            });
    }

    // Форматування дати для відображення
    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        return `${day.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${year}`;
    }

    // Основна обробка відправлення форми
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Отримуємо дані форми
            const formData = new FormData(this);
            const bookingData = {};

            for (let [key, value] of formData.entries()) {
                bookingData[key] = value;
            }

            // Валідація форми перед відправкою
            if (!validateForm(bookingData)) {
                return;
            }

            // Відображаємо індикатор завантаження або блокуємо кнопку
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Обробка...';

            // Відправляємо дані на бекенд
            fetch('http://localhost:8080/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingData)
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
                    bookingForm.reset();
                })
                .catch(error => {
                    // Обробка помилок
                    console.error('Помилка:', error);
                    showModal('errorModal');
                })
                .finally(() => {
                    // У будь-якому випадку повертаємо кнопці вихідний стан
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                });
        });
    }
});

// Функція валідації форми
function validateForm(data) {
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

    // Перевірка email
    if (!data.email || !isValidEmail(data.email)) {
        alert('Будь ласка, введіть коректний email');
        return false;
    }

    // Перевірка дати
    if (!data.date) {
        alert('Будь ласка, оберіть дату');
        return false;
    }

    // Перевірка часу
    if (!data.time) {
        alert('Будь ласка, оберіть час');
        return false;
    }

    // Перевірка послуги
    if (!data.service) {
        alert('Будь ласка, оберіть послугу');
        return false;
    }

    // Перевірка барбера
    if (!data.barber) {
        alert('Будь ласка, оберіть барбера');
        return false;
    }

    return true;
}

// Перевірка формату телефону
function isValidPhone(phone) {
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    return phoneRegex.test(phone);
}

// Перевірка формату email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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