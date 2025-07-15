
// Проверка авторизации при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
});

// Функция обновления интерфейса
function updateAuthUI() {
    const signButton = document.getElementById('signButton');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (isLoggedIn) {
        // Меняем текст кнопки
        signButton.textContent = 'Перейти в личный кабинет';
        // Меняем обработчик
        signButton.onclick = () => {
            window.location.href = 'Kabinet.html';
        };
    }
}



// Единая функция проверки авторизации
function checkAuth() {
    const accessToken = localStorage.getItem('accessToken');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const signButton = document.getElementById('signButton');

    if (signButton) {
        if (isLoggedIn && accessToken) {
            signButton.textContent = 'Перейти в личный кабинет';
            signButton.onclick = () => window.location.href = 'Kabinet.html';
        } else {
            signButton.textContent = 'Войти или Зарегистрироваться';
            signButton.onclick = openRegisterModal;
        }
    }
}

// Проверка при загрузке страницы
document.addEventListener('DOMContentLoaded', checkAuth);