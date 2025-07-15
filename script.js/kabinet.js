// Функция подтверждения выхода
function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        // Очищаем все данные аутентификации
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('isLoggedIn');
        // Перенаправляем на главную страницу
        window.location.href = 'index.html';
    }
}

// Функция проверки авторизации пользователя
function checkAuth() {
    const accessToken = localStorage.getItem('accessToken');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    // Если нет токена или флага авторизации - перенаправляем на страницу входа
    if (!accessToken || !isLoggedIn) {
        window.location.href = 'index.html';
    }
}

// Функция переключения видимости элемента
function togglePanel(panelId) {
    const panel = document.getElementById(panelId);
    if (panel) {
        panel.classList.toggle('visible');
        panel.style.display = panel.classList.contains('visible') ? 'block' : 'none';
    }
}

// Функция обновления access token
async function refreshAccessToken() {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        
        const response = await fetch('http://127.0.0.1:8000/api-core/token/refresh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refresh: refreshToken })
        });
        
        if (!response.ok) throw new Error('Token refresh failed');
        
        const data = await response.json();
        localStorage.setItem('accessToken', data.access);
        return data.access;
    } catch (error) {
        console.error('Token refresh error:', error);
        logout();
        throw error;
    }
}

// Универсальная функция для запросов с обработкой обновления токена
async function fetchDataWithTokenRefresh(url, options = {}) {
    let response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
        }
    });

    // Если получили 401 ошибку, пробуем обновить токен
    if (response.status === 401) {
        const newToken = await refreshAccessToken();
        // Повторяем запрос с новым токеном
        response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${newToken}`,
                'Content-Type': 'application/json'
            }
        });
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Ошибка запроса');
    }

    return response;
}

// Функция загрузки данных пользователя
async function loadUserData() {
    try {
        const response = await fetchDataWithTokenRefresh(
            'http://127.0.0.1:8000/api-core/api-profile/',
            { method: 'GET' }
        );

        const userData = await response.json();
        displayUserData(userData);
    } catch (error) {
        console.error('Ошибка загрузки данных пользователя:', error);
        throw error;
    }
}

// Функция отображения данных пользователя (обновленная под новую структуру API)
function displayUserData(userData) {
    // Маппинг полей формы (убрано address, так как его нет в API)
    const fieldsMapping = {
        '#mainUsername': userData.username,
        '#username': userData.username,
        '#firstName': userData.first_name,
        '#lastName': userData.last_name,
        '#email': userData.email,
        '#personalDiscount': userData.personal_discount
    };

    // Заполняем поля формы
    Object.entries(fieldsMapping).forEach(([selector, value]) => {
        const element = document.querySelector(selector);
        if (element) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.value = value || '';
            } else {
                element.textContent = value || '';
            }
        }
    });

    // Обновляем аватар (теперь поле image вместо avatar)
    if (userData.image) {
        const avatarElement = document.querySelector('.avatar');
        if (avatarElement) {
            // Добавляем параметр времени для избежания кеширования
            avatarElement.src = `${userData.image}?${Date.now()}`;
        }
    }
}

// Обработчик загрузки DOM
document.addEventListener('DOMContentLoaded', async () => {
    // Проверяем авторизацию
    checkAuth();
    
    try {
        // Загружаем данные пользователя
        await loadUserData();
        
        // Обработчики событий для панели "Финансы"
        const financesButton = document.getElementById('financesButton');
        if (financesButton) {
            financesButton.addEventListener('click', () => {
                togglePanel('financePanel');
            });
        }

        // Обработчики событий для личных данных
        const toggleButton = document.getElementById('toggleButton');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                togglePanel('userData');
            });
        }

        // Обработчик сохранения данных (обновлен под новую структуру API)
        const saveButton = document.getElementById('saveButton');
        if (saveButton) {
            saveButton.addEventListener('click', async () => {
                try {
                    const userData = {
                        username: document.getElementById('username').value,
                        first_name: document.getElementById('firstName').value,
                        last_name: document.getElementById('lastName').value,
                        email: document.getElementById('email').value
                        // address больше нет в API
                    };

                    const response = await fetchDataWithTokenRefresh(
                        'http://127.0.0.1:8000/api-core/api-profile/', 
                        {
                            method: 'PATCH',
                            body: JSON.stringify(userData)
                        }
                    );

                    if (!response.ok) throw new Error('Ошибка сохранения');
                    alert('Данные успешно сохранены!');
                } catch (error) {
                    console.error('Ошибка сохранения:', error);
                    alert(`Ошибка сохранения: ${error.message}`);
                }
            });
        }

        // Обработчик изменения аватара (теперь image вместо avatar)
        const changeAvatarButton = document.querySelector('.change-avatar-button');
        if (changeAvatarButton) {
            changeAvatarButton.addEventListener('click', () => {
                const avatarInput = document.getElementById('avatar-input');
                if (avatarInput) avatarInput.click();
            });
        }

        // Обработчик загрузки аватара (теперь image вместо avatar)
        const avatarInput = document.getElementById('avatar-input');
        if (avatarInput) {
            avatarInput.addEventListener('change', async (e) => {
                try {
                    const file = e.target.files[0];
                    if (!file) return;

                    const formData = new FormData();
                    formData.append('image', file); // Изменили 'avatar' на 'image'

                    const response = await fetch('http://127.0.0.1:8000/api-core/api-profile/', {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                        },
                        body: formData
                    });

                    if (!response.ok) throw new Error('Ошибка загрузки изображения');
                    
                    const data = await response.json();
                    if (data.image) {
                        const avatarElement = document.querySelector('.avatar');
                        if (avatarElement) {
                            avatarElement.src = `${data.image}?${Date.now()}`;
                        }
                    }
                } catch (error) {
                    console.error('Ошибка загрузки изображения:', error);
                    alert('Не удалось обновить изображение');
                }
            });
        }

    } catch (error) {
        console.error('Ошибка инициализации:', error);
        logout();
    }
});