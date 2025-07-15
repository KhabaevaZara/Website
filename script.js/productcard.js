document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const contentDiv = document.getElementById('product-content');

    if (!productId) {
        contentDiv.innerHTML = '<p class="error">Товар не найден</p>';
        return;
    }

    try {
        const response = await fetch(`http://127.0.0.1:8000/api-core/api-good-detail/${productId}/`);
        if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
        
        const product = await response.json();
        renderProductDetails(product);
    } catch (error) {
        console.error('Ошибка:', error);
        contentDiv.innerHTML = '<p class="error">Не удалось загрузить информацию о товаре</p>';
    }
});

function getCSRFToken() {
    return document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1] || '';
}

function renderProductDetails(product) {
    // Основная информация о товаре
    document.getElementById('product-name').textContent = product?.name || 'Название не указано';
    document.getElementById('product-price').textContent = product?.price ? `Цена: ${product.price} ₽` : 'Цена не указана';
    document.getElementById('product-description').textContent = product?.description || 'Описание отсутствует';
    
    // Старая цена
    const oldPriceElement = document.getElementById('product-old-price');
    oldPriceElement.innerHTML = product.start_price ? `<del>${product.start_price} ₽</del>` : '';
    oldPriceElement.style.display = product.start_price ? 'block' : 'none';

    // Галерея изображений
    const gallery = document.getElementById('product-gallery');
    const thumbnailsContainer = document.querySelector('.color-options');
    gallery.innerHTML = '';
    thumbnailsContainer.innerHTML = '';

    if (product.images?.length > 0) {
        product.images.forEach((img, index) => {
            gallery.innerHTML += createImageElement(img.image, product.name, index === 0);
            thumbnailsContainer.innerHTML += createThumbnailElement(img.image, product.name, index);
        });
    } else {
        gallery.innerHTML = createImageElement('default-image.jpg', product.name, true);
    }
}

function createImageElement(src, alt, isActive) {
    return `
        <img class="product-image ${isActive ? 'active' : ''}" 
             src="${src}" 
             alt="${alt}"
             style="height:600px; border-radius:9px; width:600px; display: ${isActive ? 'block' : 'none'}">
    `;
}

function createThumbnailElement(src, alt, index) {
    
    return `
        <div class="thumbnail" onclick="changeImage(${index})">
            <img src="${src}" 
                 alt="${alt} thumbnail"
                 style="width: 90px; height: 90px; object-fit: cover; border-radius: 5px; cursor: pointer;
                        border: 3px solid ${index === 0 ? '#688EBD' : 'transparent'}">
        </div>
    `;
}

function changeImage(index) {
    // Скрывает все основные изображения и показывает выбранное
    document.querySelectorAll('.product-image').forEach((img, i) => {
        img.style.display = i === index ? 'block' : 'none';
        img.classList.toggle('active', i === index);
    });

    //  рамки у миниатюр
    document.querySelectorAll('.thumbnail img').forEach((thumb, i) => {
        thumb.style.borderColor = i === index ? '#688EBD' : 'transparent';
    });
}

function showSection(sectionId) {
    const sections = ['prodct-info-section', 'characteristics-section', 'reviews-section'];
    sections.forEach(id => {
        document.getElementById(id).style.display = id === `${sectionId}-section` ? 'block' : 'none';
    });
}

document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        console.log(parseInt(productId))
        const quantity = parseInt(document.getElementById(`quantity`).value) || 1;
        try {
            const response = await fetch('http://127.0.0.1:8000/api-core/api-add-good/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken(),
                    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
                },
                body: JSON.stringify({
                    good: parseInt(productId),
                    quantity: quantity
                })
            });

            if (!response.ok) {
                const result = await response.json();
                const errorMsg = result.detail || result.error || JSON.stringify(result);
                throw new Error(errorMsg);
            }

            showNotification('Товар успешно добавлен в корзину!', 'success');
        } catch (error) {
            console.error('Ошибка:', error);
            showNotification(error.message, 'error');
        }
    });
});

