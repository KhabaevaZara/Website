function toggleTheme() {
    const body = document.body;
    const icon = document.querySelector('.theme-icon'); // Используем конкретный класс
    
    if (!icon) {
        console.error('Иконка не найдена!');
        return;
    }

    body.classList.toggle('dark-theme');
    body.classList.toggle('light-theme');
    
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
    
    localStorage.setItem('theme', body.classList.contains('dark-theme') ? 'dark' : 'light');
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const body = document.body;
    const icon = document.querySelector('.theme-icon');
    
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        icon?.classList.replace('fa-moon', 'fa-sun');
    } else {
        body.classList.add('light-theme');
    }
}

document.addEventListener('DOMContentLoaded', loadTheme);