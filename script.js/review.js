
let currentRating = 0;
let editingReviewId = null;
let currentGoodId = null;

// Константы для API
const API_BASE_URL = 'http://127.0.0.1:8000/api-core/';
const REVIEWS_ENDPOINT = 'api-review/';
const REVIEW_DETAIL_ENDPOINT = 'api-review-detail/';
const CREATE_REVIEW_ENDPOINT = 'api-create-review/';

// Получение ID товара со страницы
function getProductIdFromPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const currentGoodId  = urlParams.get('id');
   
    return currentGoodId ? currentGoodId : null;
}

// Получение заголовков для запросов
function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken(),
        'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
    };
}

// Получение CSRF токена
function getCSRFToken() {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
    return cookieValue || '';
}
// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    currentGoodId = getProductIdFromPage();
    
    if (!currentGoodId) {
        console.error('ID товара не найден на странице');
        return;
    }
    
    loadAndDisplayReviews(currentGoodId);
    if (getCSRFToken()) {
        document.getElementById('review-form').style.display = 'block';
    }
    
    initRatingStars();
});

// Инициализация  рейтинга
function initRatingStars() {
    const stars = document.querySelectorAll('.review-star');
    stars.forEach((star, index) => {
        star.addEventListener('click', () => setReviewRating(index + 1));
    });
}
// Установка рейтинга
function setReviewRating(rating) {
    currentRating = rating;
    const stars = document.querySelectorAll('.review-star');
    
    stars.forEach((star, index) => {
        star.classList.toggle('active', index < rating);
    });
}
// Загрузка и отображение отзывов
async function loadAndDisplayReviews(productId) {
    try {
        const reviews = await loadReviews(productId);
        displayReviews(reviews);
    } catch (error) {
        console.error('Ошибка при загрузке отзывов:', error);
        document.getElementById('reviews-list').innerHTML = 
            '<p class="error-message">Не удалось загрузить отзывы. Пожалуйста, попробуйте позже.</p>';
    }
}
// Загрузка отзывов с сервера
async function loadReviews(productId) {
    const url = `${API_BASE_URL}${REVIEWS_ENDPOINT}${productId}/`;

    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Ошибка при загрузке отзывов:', error);
        throw error;
    }
}
// Отображение отзывов
function displayReviews(reviews) {
    const reviewsList = document.getElementById('reviews-list');
    
    if (!reviewsList) {
        console.error('Элемент для отображения отзывов не найден');
        return;
    }  
    reviewsList.innerHTML = '';
    
    if (!reviews || reviews.length === 0) {
        reviewsList.innerHTML = '<p class="no-reviews">Пока нет отзывов. Будьте первым!</p>';
        return;
    }
    
    reviews.forEach(review => {
        const reviewElement = createReviewElement(review);
        reviewsList.appendChild(reviewElement);
    });
}
// Создание элемента отзыва
function createReviewElement(review) {
    const reviewElement = document.createElement('div');
    reviewElement.className = 'review-item';
    reviewElement.dataset.reviewId = review.id;
    
    const isMyReview = checkIfMyReview(review.user_id);
    const ratingStars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    
    reviewElement.innerHTML = `
        <div class="review-header">
            <span class="review-author">${review.user_name || 'Аноним'}</span>
            <span class="review-date">${formatDate(review.created_at)}</span>
            <div class="review-rating-display">${ratingStars}</div>
        </div>
        <div class="review-content">${review.text}</div>
        ${isMyReview ? createReviewActions(review.id) : ''}
    `;
    
    return reviewElement;
}
// Создание кнопок действий для отзыва
function createReviewActions(reviewId) {
    return `
        <div class="review-actions">
            <button class="edit-btn" onclick="startEditReview('${reviewId}')">Редактировать</button>
            <button class="delete-btn" onclick="deleteReview('${reviewId}')">Удалить</button>
        </div>
    `;
}



// Отправка отзыва
async function submitReview() {
    const reviewText = document.getElementById('review-text')?.value.trim();
    
    if (!validateReviewInput(reviewText)) {
        return;
    }
    
    const reviewData = {
        good: currentGoodId,
        text: reviewText,
        rating: currentRating
    };
    
    try {
        const url = editingReviewId 
            ? `${API_BASE_URL}${REVIEW_DETAIL_ENDPOINT}${editingReviewId}/`
            : `${API_BASE_URL}${CREATE_REVIEW_ENDPOINT}`;
            
        const method = editingReviewId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(reviewData)
        });        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        await response.json();
        resetReviewForm();
        await loadAndDisplayReviews(currentGoodId);
    } catch (error) {
        console.error('Ошибка при сохранении отзыва:', error);
        showAlert('Не удалось сохранить отзыв. Пожалуйста, попробуйте позже.');
    }
}
// Валидация ввода отзыва
function validateReviewInput(reviewText) {
    if (!reviewText) {
        showAlert('Пожалуйста, введите текст отзыва');
        return false;
    }
    
    if (currentRating === 0) {
        showAlert('Пожалуйста, поставьте оценку');
        return false;
    }
    
    return true;
}
// Показать сообщение об ошибке
function showAlert(message) {
    // Можно заменить на более красивый toast или модальное окно
    alert(message);
}
// Начало редактирования отзыва
function startEditReview(reviewId) {
    const reviewItem = document.querySelector(`.review-item[data-review-id="${reviewId}"]`);
    if (!reviewItem) return;
    
    const reviewContent = reviewItem.querySelector('.review-content')?.textContent || '';
    const reviewRating = (reviewItem.querySelector('.review-rating-display')?.textContent.match(/★/g) || []).length;
    
    document.getElementById('review-text').value = reviewContent;
    setReviewRating(reviewRating);
    editingReviewId = reviewId;
    
    document.getElementById('review-form').scrollIntoView({ behavior: 'smooth' });
}

// Удаление отзыва
async function deleteReview(reviewId) {
    if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${REVIEW_DETAIL_ENDPOINT}${reviewId}/`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        await loadAndDisplayReviews(currentGoodId);
    } catch (error) {
        console.error('Ошибка при удалении отзыва:', error);
        showAlert('Не удалось удалить отзыв. Пожалуйста, попробуйте позже.');
    }
}

// Сброс формы отзыва
function resetReviewForm() {
    const reviewText = document.getElementById('review-text');
    if (reviewText) reviewText.value = '';
    
    setReviewRating(0);
    editingReviewId = null;
}

// Показать все отзывы
function showAllReviews() {
    toggleActiveButton('all-reviews-btn', 'my-reviews-btn');
    console.log(window.location)
    loadAndDisplayReviews(currentGoodId);
}

// Показать мои отзывы
async function showMyReviews() {
    toggleActiveButton('my-reviews-btn', 'all-reviews-btn');
    
    try {
        const reviews = await loadReviews(currentGoodId);
        const myReviews = reviews.filter(review => checkIfMyReview(review.user_id));
        displayReviews(myReviews);
    } catch (error) {
        console.error('Ошибка при загрузке моих отзывов:', error);
        showAlert('Не удалось загрузить ваши отзывы. Пожалуйста, попробуйте позже.');
    }
}

// Переключение активной кнопки
function toggleActiveButton(activeId, inactiveId) {
    const activeBtn = document.getElementById(activeId);
    const inactiveBtn = document.getElementById(inactiveId);
    
    if (activeBtn) activeBtn.classList.add('active');
    if (inactiveBtn) inactiveBtn.classList.remove('active');
}

// Форматирование даты
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (e) {
        console.error('Ошибка форматирования даты:', e);
        return dateString;
    }
}