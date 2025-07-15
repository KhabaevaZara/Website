// Регистрация

const socialLink = document.querySelector('.social-link');
const tooltip = document.getElementById('tooltip');
const account = document.getElementById('account');
const registerModal = document.getElementById('registerModal');
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const signInBtnLink = document.querySelector('.signInBtn-link');
const signUpBtnLink = document.querySelector('.signUpBtn-link');
const signButton = document.getElementById('signButton');
const modal = document.querySelector('.modal');
let accountVisible = false;
//виден
function hideTooltip() {
    tooltip.style.display = 'none';
}
//переключение видимости
function toggleAccount() {
    accountVisible = !accountVisible;
    account.style.display = accountVisible ? 'block' : 'none';
}
//скрыть акк
function hideAccount() {
    if (accountVisible) {
        accountVisible = false;
        account.style.display = 'none';
    }
}

function hideCart() {
    document.getElementById('cart').style.display = 'none';
}

function openRegisterModal() {
    document.body.style.overflow = 'hidden';
    registerModal.style.display = 'block';
}

function closeRegisterModal() {
    document.body.style.overflow = 'auto';
    registerModal.style.display = 'none';
}


// Обработчик для формы регистрации
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    
    // Функция для обновления кнопки авторизации
    function updateAuthButton() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const signButton = document.getElementById('signButton');
        if (signButton) {
            signButton.textContent = isLoggedIn ? 'Перейти в личный кабинет' : 'Войти или Зарегистрироваться';
            // Изменяем обработчик для авторизованных пользователей
            signButton.onclick = isLoggedIn 
                ? () => window.location.href = 'Kabinet.html'
                : openRegisterModal;
        }
    }

    // Вызываем при первоначальной загрузке
    updateAuthButton();

    // Проверка существования формы
    if (!registerForm) {
        console.error('Форма регистрации не найдена');
        return;
    }

    let loginAttempts = 0;
    const maxLoginAttempts = 3;
    const blockTime = 30000;

    function isPasswordStrong(password) {
        const minLength = 4;
        return password.length >= minLength;
    }

    function sanitizeInput(input) {
        return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function highlightEmptyFields() {
        const fields = [
            'registerusername',      
            'registerFirstName', 
            'registerLastName', 
            'registerEmail', 
            'registerPassword', 
            'registerRepeatPassword'
        ];
        let isEmptyField = false;
        
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field?.value.trim()) { 
                field.style.border = '1px solid red';
                isEmptyField = true;
            } else {
                field.style.border = '';
            }
        });
        return isEmptyField;
    }

    registerForm.onsubmit = async (event) => {
        event.preventDefault();

        if (highlightEmptyFields()) {
            alert('Пожалуйста, заполните все поля.');
            return;
        }
        const username = sanitizeInput(document.getElementById('registerusername').value);
        const firstName = sanitizeInput(document.getElementById('registerFirstName').value);
        const lastName = sanitizeInput(document.getElementById('registerLastName').value);
        const email = sanitizeInput(document.getElementById('registerEmail').value);
        const password = document.getElementById('registerPassword').value;
        const repeatPassword = document.getElementById('registerRepeatPassword').value;

        if (password !== repeatPassword) {
            alert('Пароли не совпадают');
            return;
        }

        if (!isPasswordStrong(password)) {
            alert('Пароль должен содержать минимум 4 символа.');
            return;
        }

        if (loginAttempts >= maxLoginAttempts) {
            alert('Слишком много попыток. Попробуйте позже.');
            setTimeout(() => { loginAttempts = 0; }, blockTime);
            return;
        }

        try {
            // Запрос регистрации
            const registerResponse = await fetch('http://127.0.0.1:8000/api-core/api-register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    password,
                    repeat_password: repeatPassword  
                }),
            });

            if (!registerResponse.ok) {
                const errorData = await registerResponse.json();
                throw new Error(errorData.detail || errorData.message || 'Ошибка регистрации');
            }

            const loginResponse = await fetch('http://127.0.0.1:8000/api-auth/jwt/create/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });

            if (!loginResponse.ok) {
                const errorData = await loginResponse.json();
                throw new Error(errorData.detail || 'Ошибка автоматического входа');
            }

            const { access, refresh } = await loginResponse.json();
            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);
            localStorage.setItem('isLoggedIn', 'true');
            updateAuthButton(); // Обновляем кнопку
            localStorage.setItem('username', username);

            closeRegisterModal();
            window.location.href = 'Kabinet.html';

        } catch (error) {
            console.error('Ошибка:', error);
            loginAttempts++;  
            alert(error.message || 'Произошла ошибка');
            closeRegisterModal();
        }
    };
});


// Обработчик для формы входа
document.getElementById('loginForm').onsubmit = async (event) => {
    event.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('http://127.0.0.1:8000/api-auth/jwt/create/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Ошибка ответа сервера:', errorData);
            
            let errorMessage = errorData.detail || `Ошибка входа: ${response.status} ${response.statusText}`;
            if (errorData.non_field_errors) {
                errorMessage = errorData.non_field_errors.join(', ');
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        const accessToken = data.access;
        const refreshToken = data.refresh;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);

     
        const updateAuthUI = () => {
            const signButton = document.getElementById('signButton');
            if (signButton) {
                signButton.textContent = 'Перейти в кабинет';
                signButton.onclick = () => window.location.href = 'Kabinet.html';
            }
        };

        updateAuthUI(); // Теперь функция определена
        window.location.href = 'Kabinet.html';

    } catch (error) {
        console.error('Ошибка входа:', error);
        alert(`Ошибка входа: ${error.message || 'Неизвестная ошибка'}`);
    }
};

    // Добавение  обработчика для переключения модального окна (прокрутка регистрации )
    signUpBtnLink.addEventListener('click', () => {
        modal.classList.toggle('active'); // Переключение на  активный класс
    });

    signInBtnLink.addEventListener('click', () => {
        modal.classList.toggle('active'); // Переключение на  активный класс
    });
