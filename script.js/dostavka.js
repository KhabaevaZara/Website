document.addEventListener('DOMContentLoaded', function () {
    const supportButton = document.getElementById('supportButton');
    const contactFormSection = document.getElementById('contactFormSection');
    const contactForm = document.getElementById('contactForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    // Проверяем аутентификацию и загружаем данные пользователя
    async function loadUserData() {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) return;
        try {
            const response = await fetch('http://127.0.0.1:8000/api-core/api-profile/', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const userData = await response.json();
                // Заполняем поля формы данными пользователя
                if (userData.username ) {
                    nameInput.value = `${userData.username || ''}`.trim();
                }
                if (userData.email) {
                    emailInput.value = userData.email;
                }
            }
        } catch (error) {
            console.error('Ошибка при загрузке данных пользователя:', error);
        }
    }
    
    // Загружаем данные пользователя при загрузке страницы
    loadUserData();
    
    // Показываем/скрываем форму
    supportButton.addEventListener('click', function () {
        contactFormSection.classList.toggle('visible');
        if (contactFormSection.classList.contains('visible')) {
            contactFormSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
    
    // Обработка отправки формы
    contactForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = document.getElementById('message').value.trim();
        
        // Проверка заполнения полей
        if (!name) {
            alert('Пожалуйста, введите ваше имя.');
            nameInput.focus();
            return;
        }
        
        if (!email) {
            alert('Пожалуйста, введите ваш email.');
            emailInput.focus();
            return;
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            alert('Пожалуйста, введите корректный email адрес.');
            emailInput.focus();
            return;
        }
        
        if (!message) {
            alert('Пожалуйста, введите ваше сообщение.');
            document.getElementById('message').focus();
            return;
        }
        
        try {
            // Проверяем наличие токена доступа
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                alert('Ошибка авторизации. Пожалуйста, войдите в систему.');
                window.location.href = '/login';
                return;
            }
            
            // Отображаем индикатор загрузки
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Отправка...';
            
            // Отправляем данные на сервер
            const response = await fetch('http://127.0.0.1:8000/api-core/create-message/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken(),
                    'Authorization': 'Bearer ' + accessToken
                },
                body: JSON.stringify({
                    question: message,
                })
            });
            
            // Восстанавливаем кнопку
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Ошибка при отправке сообщения');
            }
            
            // Успешная отправка
            alert('Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.');
            contactForm.reset();
            // Восстанавливаем данные пользователя после сброса формы
            loadUserData();
            contactFormSection.classList.remove('visible');
        } catch (error) {
            console.error('Ошибка:', error);
            alert(`Произошла ошибка: ${error.message}`);
        }
    });
});



function getCSRFToken() {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
    return cookieValue || '';
}