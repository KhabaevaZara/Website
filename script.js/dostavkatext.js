function showContent(section) {
    // Скрыть все 
    var contents = document.querySelectorAll('.content');
    contents.forEach(content => {
        content.style.display = 'none';
    });

    // Показать выбранную сек
    document.getElementById(section).style.display = 'block';

    // Удалить active-tab со всех вкладок
    var tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.classList.remove('active-tab');
    });

    // Добавить  active-tab к активной сек
    const tab = document.querySelector(`.tab[onclick="showContent('${section}')"]`);
    tab.classList.add('active-tab');
}


// create message
document.addEventListener('DOMContentLoaded', function() {
    fetch('http://127.0.0.1:8000/api-core/message-list/')
        .then(response => {
            console.log('Status:', response.status);
            if (!response.ok) throw new Error('HTTP error');
            return response.json();
        })
        .then(data => {
            console.log('Data:', data);
            const container = document.getElementById('messagesContainer');
            
            if (!data.length) {
                container.innerHTML = '<p>Нет сообщений.</p>';
                return;
            }

            data.forEach(message => {
                const messageEl = document.createElement('div');
                messageEl.className = 'message-item';

                const question = document.createElement('div');
                question.className = 'message-question';
                question.textContent = message.question;
                messageEl.appendChild(question);

                const answer = document.createElement('div');
                answer.className = 'message-answer';
                answer.textContent = message.answer ? `Ответ: ${message.answer}` : '(Нет ответа)';
                messageEl.appendChild(answer);

                const date = document.createElement('div');
                date.className = 'message-date';
                date.textContent = new Date(message.created).toLocaleString();
                messageEl.appendChild(date);

                container.appendChild(messageEl);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('messagesContainer').innerHTML = 
                '<p>Ошибка загрузки сообщений.</p>';
        });
});


//all messages
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('messagesContainer');
    
    if (!container) {
        console.error('Элемент messagesContainer не найден в DOM');
        return;
    }
    fetch('http://127.0.0.1:8000/api-core/message-list/', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Получены данные:', data); 
        container.innerHTML = '';
        const messages = Array.isArray(data) ? data : [data];
        
        if (messages.length === 0) {
            container.innerHTML = '<p>Пока нет сообщений.</p>';
            return;
        }
        messages.forEach(message => {
            if (!message) return; 
            
            const messageElement = document.createElement('div');
            messageElement.className = 'message-item';
            
            messageElement.innerHTML = `
                <div class="message-question">${message.question || '(Нет вопроса)'}</div>
                ${message.answer ? `<div class="message-answer">Ответ: ${message.answer}</div>` : '<div class="message-answer">(Пока нет ответа)</div>'}
                <div class="message-date">${message.created ? new Date(message.created).toLocaleString() : '(Дата не указана)'}</div>
            `;
            
            container.appendChild(messageElement);
        });
    })
    .catch(error => {
        console.error('Ошибка при загрузке сообщений:', error);
        container.innerHTML = '<p>Не удалось загрузить сообщения. Пожалуйста, попробуйте позже.</p>';
    });
});

