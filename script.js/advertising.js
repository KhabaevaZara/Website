document.addEventListener('DOMContentLoaded', function() {
    const itemsContainer = document.querySelector('.itms');
    const prevButton = document.querySelector('.buprev');
    const nextButton = document.querySelector('.bunext');
    const slides = document.querySelectorAll('.itm');
    let currentIndex = 0;

    function updateCarousel() {
        // Перемещаем контейнер со слайдами
        itemsContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // Обновляем состояние кнопок
        prevButton.disabled = currentIndex === 0;
        nextButton.disabled = currentIndex === slides.length - 1;
    }

    // Обработчики кликов на кнопки
    prevButton.addEventListener('click', () => {
        if(currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    nextButton.addEventListener('click', () => {
        if(currentIndex < slides.length - 1) {
            currentIndex++;
            updateCarousel();
        }
    });

    // Инициализация карусели
    updateCarousel();
});